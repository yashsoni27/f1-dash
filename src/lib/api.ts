const JOLPICA_API_BASE = "https://api.jolpi.ca/ergast/f1/";
// const API_KEY = process.env.JOLPICA_API_KEY || '';

// Interface for API response types
interface ApiResponse<T> {
  data: T;
  status: number;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

function transformResponse<T>(
  mrData: any,
  dataKey: string
): { data: T } & PaginationInfo {
  return {
    data: mrData[`${dataKey}Table`],
    total: parseInt(mrData.total),
    limit: parseInt(mrData.limit),
    offset: parseInt(mrData.offset),
  };
}

// Generic fetch function with error handling
async function fetchFromApi<T>(
  endpoint: string,
  dataKey: string,
  limit: number = 30,
  offset: number = 0
): Promise<{ data: T } & PaginationInfo> {
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  const url = `${JOLPICA_API_BASE}${endpoint}.json?${queryParams}`;

  const response = await fetch(url, {
    headers: {
      // 'Authorization': `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}, ${response.statusText}`);
  }

  const mrData = await response.json();
  return transformResponse<T>(mrData.MRData, dataKey);
}

/* -------------------------------------------------------------------------- */
/*                                API Endpoints                               */
/* -------------------------------------------------------------------------- */

// Season info [Testing]
export async function getSeason(
  season = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/seasons`,
    "Season",
    limit,
    offset
  );
  // console.log(result);
  return result;
}

// Race calendar
export async function getRaceCalendar(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(`${season}/races`, "Race", limit, offset);
  return result;
}

// Next Race
export async function getNextRace(season: string = "current") {
  const result = await fetchFromApi<any>(`${season}/races`, "Race");
  const races = result.data?.Races;

  if (!races || races.length === 0) return null;

  const today = new Date();

  const nextRace = races.find((race: any) => {
    const raceDate = new Date(race.date);
    return raceDate >= today
  });
  
  return nextRace;
}

// Constructor info
export async function getConstructors(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/constructors`,
    "Constructor",
    limit,
    offset
  );
  return result;
}

// Driver info
export async function getDriverInfo(
  season: string = "current",
  driverId: string = "",
  limit: number = 30,
  offset: number = 0
) {
  if (driverId == "") {
    const result = await fetchFromApi(
      `${season}/drivers`,
      "Driver",
      limit,
      offset
    );
    return result;
  } else {
    const result = await fetchFromApi(
      `${season}/drivers/${driverId}`,
      "Driver"
    );
    return result;
  }
}

// Qualifying results
export async function getQualificationResults(
  season: string = "current",
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/qualifying`,
    "Race",
    limit,
    offset
  );
  return result;
}

// Sprint results
export async function getSprintResults(
  season: string = "current",
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/sprint`,
    "Race",
    limit,
    offset
  );
  return result;
}

// Race results
export async function getRaceResults(
  season: string,
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/results`,
    "Race",
    limit,
    offset
  );
  return result;
}

// PitStop info
export async function getPitStopInfo(
  season: string = "current",
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/pitstops`,
    "Race",
    limit,
    offset
  );
  return result;
}

// Lap info
export async function getLapInfo(
  season: string = "current",
  round: string,
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi(
    `${season}/${round}/laps`,
    "Race",
    limit,
    offset
  );
  return result;
}

// Driver standings
export async function getDriverStandings(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi<any>(
    `${season}/driverStandings`,
    "Standings",
    limit,
    offset
  );
  
  return {
    standings: result.data?.StandingsLists[0]?.DriverStandings || [],
    season: result.data?.StandingsLists[0]?.season || "",
    pagination: {
      total: result.total,
      limit: result.limit,
      offset: result.offset
    }
  };
}

// Constructor standings
export async function getConstructorStandings(
  season: string = "current",
  limit: number = 30,
  offset: number = 0
) {
  const result = await fetchFromApi<any>(
    `${season}/constructorStandings`,
    "Standings",
    limit,
    offset
  );

  return {
    standings: result.data?.StandingsLists[0]?.ConstructorStandings || [],
    season: result.data?.StandingsLists[0]?.season || "",
    pagination: {
      total: result.total,
      limit: result.limit,
      offset: result.offset
    }
  };
}
