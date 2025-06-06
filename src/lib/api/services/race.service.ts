import {
  circuitIdToF1Adapter,
  getConstructorHex,
  minuteStrToSeconds,
} from "@/lib/utils";
import { JolpicaApiClient } from "../clients/jolpica";
import { OpenF1ApiClient } from "../clients/openf1";
import { F1MediaApiClient } from "../clients/f1media";
import { CacheService } from "@/lib/cache/cache.service";
import { RaceRepository } from "@/lib/db/race.repository";

export class RaceService {
  private cacheService: CacheService;
  private raceRepository: RaceRepository;

  constructor(
    private apiClient: JolpicaApiClient,
    private openF1Client: OpenF1ApiClient,
    private f1MediaClient: F1MediaApiClient
  ) {
    this.cacheService = CacheService.getInstance();
    this.raceRepository = new RaceRepository();
  }

  // Race calendar
  async getRaceCalendar(
    season: string = "current",
    limit: number = 30,
    offset: number = 0
  ) {
    const dbData = await this.raceRepository.getAllRaces(Number(season));
    if ((dbData?.data?.Races?.length ?? 0) > 0) {
      return dbData;
    }
    
    // Fallback to API call
    const apiData: any = await this.apiClient.fetchFromApi(
      `${season}/races`,
      "Race",
      limit,
      offset
    );
    if (season == "current") {
      season = apiData?.data?.season;
    }
    const meetings: any = await this.getAllMeetingIds(season);

    // Save API data to DB for future requests
    if (apiData?.data?.Races) {
      for (const race of apiData.data.Races) {
        const meeting = meetings?.meetings?.filter(
          (m: any) => m.round === parseInt(race.round)
        );
        race.Circuit.Location.meetingCode = meeting?.[0]?.meetingCode;
        await this.raceRepository.saveRace(race);
      }
    }

    return apiData;
  }

  // Get Sprint rounds
  async getSprintRounds(season: string = "current") {
    try {
      const races = await this.getRaceCalendar(season);
      const sprintRounds: number[] = [];

      (races?.data as { Races: any[] }).Races.forEach((race: any) => {
        if (race.Sprint) {
          sprintRounds.push(parseInt(race.round));
        }
      });

      return {
        season,
        sprintRounds,
        total: sprintRounds.length,
      };
    } catch (error) {
      console.error("Error fetching sprint rounds:", error);
      return { season, sprintRounds: [], total: 0 };
    }
  }

  // Next Race
  async getNextRace(season: string = "current") {
    if (season === "current") {
      season = new Date().getFullYear().toString();
    }
    const result: any = await this.getRaceCalendar(season);
    const races = result?.data?.Races;

    if (!races || races.length === 0) return null;

    const now = new Date();

    const nextRace = races.find((race: any) => {
      const raceDateTime = new Date(`${race.date}T${race.time}`);
      const raceEndTime = new Date(raceDateTime.getTime() + 2 * 60 * 60 * 1000);
      return raceEndTime >= now;
    });

    return nextRace;
  }

  // Previous Races
  async getPreviousRaces(season: string = "current") {
    if (season === "current") {
      season = new Date().getFullYear().toString();
    }
    const result = await this.getRaceCalendar(season);
    const races = result.data?.Races;

    if (!races || races.length === 0) return [];

    const today = new Date();

    const previousRaces = races
      .filter((race: any) => {
        const raceDate = new Date(race.date);
        return raceDate < today;
      })
      .sort((a: any, b: any) => b.round - a.round);

    return previousRaces;
  }

  // Qualifying results
  async getQualificationResults(
    season: string = "current",
    round: string,
    limit: number = 30,
    offset: number = 0
  ) {
    const result = await this.apiClient.fetchFromApi(
      `${season}/${round}/qualifying`,
      "Race",
      limit,
      offset
    );
    const races = (result?.data as { Races: any[] })?.Races || [];
    const qualifications = races[0]?.QualifyingResults;

    let overallMin = Infinity,
      overallMax = -Infinity;

    const formattedResult = qualifications.map((item: any) => {
      const q1Time = minuteStrToSeconds(item?.Q1) || 0;
      const q2Time = minuteStrToSeconds(item?.Q2) || 0;
      const q3Time = minuteStrToSeconds(item?.Q3) || 0;

      // Update min/max values
      if (q1Time) {
        overallMin = Math.min(overallMin, q1Time);
        overallMax = Math.max(overallMax, q1Time);
      }
      if (q2Time) {
        overallMin = Math.min(overallMin, q2Time);
        overallMax = Math.max(overallMax, q2Time);
      }
      if (q3Time) {
        overallMin = Math.min(overallMin, q3Time);
        overallMax = Math.max(overallMax, q3Time);
      }

      return {
        name: item.Driver.familyName,
        driverCode: item.Driver.code,
        color: getConstructorHex(item.Constructor.constructorId),
        Q1: q1Time,
        Q2: q2Time,
        Q3: q3Time,
        position: item?.position || null,
      };
    });

    return {
      result: formattedResult,
      range: {
        min: overallMin !== Infinity ? overallMin : 0,
        max: overallMax !== -Infinity ? overallMax : 0,
      },
    };
  }

  // Sprint results
  async getSprintResults(
    season: string = "current",
    round: string | number,
    limit: number = 30,
    offset: number = 0
  ) {
    const result = await this.apiClient.fetchFromApi(
      `${season}/${round}/sprint`,
      "Race",
      limit,
      offset
    );
    return result;
  }

  // Race results
  async getRaceResults(
    season: string,
    round: number | string,
    limit: number = 30,
    offset: number = 0
  ) {
    const result = await this.apiClient.fetchFromApi(
      `${season}/${round}/results`,
      "Race",
      limit,
      offset
    );
    const response = Array.isArray((result.data as { Races: any[] })?.Races)
      ? (result.data as { Races: any[] }).Races[0]
      : undefined;
    return response?.Results;
  }

  // Get meeting Ids from OpenF1
  async getAllMeetingIds(season?: string | number) {
    try {
      if (!season) {
        const year = new Date().getFullYear();
        season = year;
      }
      const meetings = await this.openF1Client.fetchFromOpenF1(
        `meetings?year=${season}`
      );

      // Filter out pre-season testing events and sort by date
      const raceMeetings = meetings
        .filter(
          (meeting: any) =>
            !meeting.meeting_name.toLowerCase().includes("testing")
        )
        .sort(
          (a: any, b: any) =>
            new Date(a.date_start).getTime() - new Date(b.date_start).getTime()
        );

      // Map to simplified format with just the essential info
      const meetingIds = raceMeetings.map((meeting: any, index: number) => ({
        meetingKey: meeting.meeting_key,
        meetingCode: meeting.meeting_code,
        meetingName: meeting.meeting_name,
        circuitName: meeting.circuit_short_name,
        dateStart: meeting.date_start,
        round: index + 1,
      }));

      return {
        season,
        meetings: meetingIds,
      };
    } catch (e) {
      console.log("Error in fetching MeetingIds: ", e);
    }
  }

  // Get meeting id for round and season
  async getMeetingId(round: number, season?: string | number) {
    try {
      const meetingIds = await this.getAllMeetingIds();
      const meeting = meetingIds?.meetings?.filter(
        (m: any) => m.round === round
      );

      return meeting[0].meetingKey;
    } catch (e) {
      console.log("Error in fetching meeting Id: ", e);
    }
  }
}
