"use client";
import { ChevronDown, ChevronUp, Minus, MoveRight } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import StandingsTableSkeleton from "../loading/StandingsTableSkeleton";
import { useSearchParams } from "next/navigation";
import { constructorService, driverService } from "@/lib/api/index";

interface Standings {
  position: number | string;
  driver: string;
  constructor: string;
  points: number;
  evolution?: number;
  team?: string;
}

function StandingsTableContent({
  name,
  season = "current",
}: {
  name: string;
  season?: string;
}) {
  const searchParams = useSearchParams();
  const title = searchParams.get("title");
  const [standings, setStandings] = useState<Standings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async (name: string, season: string = "current") => {
      setIsLoading(true);
      try {
        if (name === "Drivers") {
          const response = await driverService.getDriverStandings(season);

          const formattedDrivers = response.standings
            .slice(0, title === null ? 10 : response.standings.length + 1)
            .map((item: any) => ({
              position: Number(item.position),
              driver: item.Driver.familyName,
              points: Number(item.points),
              team:
                item.Constructors[item.Constructors.length - 1]
                  ?.constructorId || "Unknown",
              evolution: item.positionDifference,
            }));

          setStandings(formattedDrivers);
        } else if (name === "Constructors") {
          const response = await constructorService.getConstructorStandings();

          const formattedConstructors = response.standings.map((item: any) => ({
            position: Number(item.position),
            constructor: item.Constructor.name,
            points: Number(item.points),
            team: item.Constructor?.constructorId || "Unknown",
            evolution: item.positionDifference,
          }));

          setStandings(formattedConstructors);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData(name, season);
  }, [season]);

  if (isLoading) {
    return <StandingsTableSkeleton />;
  }

  return (
    <div className="md:row-start-4 lg:row-start-3 rounded-lg border max-w-md border-gray-700 pt-2">
      <h2 className="scroll-m-20 text-xl font-semibold tracking-tight p-4">
        {name} Standings
      </h2>
      <div className="aspect-[1/1]">
        <div className="relative w-full overflow-auto">
          <table className="w-full text-left ">
            <thead>
              <tr className="text-sm font-thin text-gray-500">
                <th className="pb-3 text-center w-1/6">Pos.</th>
                <th className="pb-3 text-left w-3/6">{name}</th>
                <th className="pb-3 text-right w-1/6">Points</th>
                <th className="pb-3 text-center w-1/6">Evo.</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((standing) => (
                <tr
                  key={standing.position}
                  className="text-sm hover:bg-slate-900 delay-75"
                >
                  <td className="py-3 align-middle text-center border-t border-gray-700">
                    {standing.position}
                  </td>
                  <td className="py-3 align-middle text-center border-t border-gray-700">
                    <div className="flex items-center gap-2">
                      {standing.team && (
                        <img
                          src={`/teams/${standing.team}.svg`}
                          alt={standing.team}
                          className="w-6 h-6"
                          onError={(e) => (e.currentTarget.src = "/vercel.svg")}
                        />
                      )}
                      {standing.driver ? standing.driver : standing.constructor}
                    </div>
                  </td>
                  <td className="py-3 align-middle text-right border-t border-gray-700">
                    {standing.points}
                  </td>
                  <td
                    className={`py-3 align-middle text-center text-gray-300 border-t border-gray-700`}
                  >
                    {standing.evolution !== undefined ? (
                      standing.evolution > 0 ? (
                        <>
                          <ChevronUp
                            className="text-green-500 inline-block align-middle"
                            size={20}
                          />
                          <div className="pl-1 inline-block align-middle">
                            {Math.abs(standing.evolution)}
                          </div>
                        </>
                      ) : standing.evolution < 0 ? (
                        <>
                          <ChevronDown
                            className="text-red-500 inline-block align-middle"
                            size={20}
                          />
                          <div className="pl-1 inline-block align-middle">
                            {Math.abs(standing.evolution)}
                          </div>
                        </>
                      ) : (
                        <Minus
                          size={12}
                          className="text-gray-500 inline-block align-middle"
                        />
                      )
                    ) : (
                      <Minus
                        size={12}
                        className="text-gray-500 inline-block align-middle"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {title == null ? (
          <Link
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm hover:bg-slate-900 delay-75 h-9 w-full rounded-t-none border-t border-gray-700 p-6"
            href={{
              pathname: "/standings",
              query: { title: name },
            }}
          >
            Full Standings
            <MoveRight className="text-gray-200 pl-2" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

const StandingsTable = (props: { name: string; season?: string }) => {
  return (
    <Suspense fallback={<StandingsTableSkeleton />}>
      <StandingsTableContent {...props} />
    </Suspense>
  );
};

export default StandingsTable;
