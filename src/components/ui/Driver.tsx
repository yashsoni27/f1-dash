"use client";

import { liveToJolpicaConstructor } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const drsEnabledValues = [10, 12, 14];
const gridCols = "3rem 6.5rem 3.5rem 5.5rem 4rem 5rem 6.5rem 30rem 10.5rem";

const getPosChangeColor = (pos: any, gridPos: any) => {
  if (pos < gridPos) return "limegreen";
  if (pos > gridPos) return "red";
  return "grey";
};

const getSegmentColor = (status: number) => {
  switch (status) {
    case 2048:
      return "yellow";
    case 2049:
      return "green";
    case 2051:
      return "purple";
    case 2064:
      return "blue";
    default:
      return "dimgrey";
  }
};

export default function Driver({
  racingNumber,
  line,
  DriverList,
  CarData,
  TimingAppData,
  TimingStats,
  SessionName,
}: any) {
  const driver = DriverList[racingNumber];
  const carData =
    CarData.Entries[CarData.Entries.length - 1].Cars[racingNumber].Channels;
  // Channels
  // 0 : rpm
  // 2 : speed (km/h)
  // 3 : n_gear (num)
  // 4 : throttle (%)
  // 5 : brake (0 or 100)
  // 45 : drs status

  const rpmPercent = (carData["0"] / 15000) * 100;
  const throttlePercent = Math.min(100, carData["4"]);
  const brakeApplied = carData["5"] > 0;

  const appData = TimingAppData?.Lines[racingNumber];
  let currentStint: any;
  if (appData?.Stints) {
    const stints = Object.values(appData.Stints);
    currentStint = stints[stints.length - 1];
  }

  const [posChanged, setPosChanged] = useState<any>();
  const [prevPos, setPrevPos] = useState<any>();

  useEffect(() => {
    const pos = Number(line.Position);
    if (prevPos !== undefined && pos !== prevPos) {
      setPosChanged(getPosChangeColor(pos, prevPos));
      setTimeout(() => {
        setPosChanged(undefined);
      }, 2000);
    }

    setPrevPos(pos);
  }, [line.Position]);

  return (
    <>
      <div
        style={{
          opacity: line.KnockedOut || line.Retired || line.Stopped ? 0.5 : 1,
        }}
      >
        <div className="flex flex-col gap-1 rounded-lg p-2 select-none">
          <div
            className="grid items-center gap-2 mx-2"
            style={{
              gridTemplateColumns:
                "2.5rem 6.5rem 3.5rem 5.5rem 4.5rem 5rem 6.5rem 25rem 6rem 6rem",
            }}
          >
            <div title="Position">
              <p
                className={`px-1 text-sm leading-none ${
                  TimingStats.Lines[racingNumber]?.PersonalBestLapTime
                    ?.Position === 1
                    ? "text-purple-500"
                    : "text-white"
                }`}
              >
                {line.Position}
              </p>
            </div>

            <div
              title="Driver"
              className="flex w-fit items-center justify-start gap-0.5 rounded-lg  font-medium min-w-full"
            >
              <img
                src={`/teams/${liveToJolpicaConstructor(driver?.TeamName)}.svg`}
                alt={driver?.TeamName}
                className="w-6 h-6"
                onError={(e) => (e.currentTarget.src = "/vercel.svg")}
              />
              <div className="flex h-min w-min items-center justify-center px-1">
                <p className=" text-slate-300">{driver?.Tla}</p>
              </div>
              {/* <p
                className="px-1 text-sm"
                style={{
                  color: driver?.TeamColour
                    ? `#${driver?.TeamColour}`
                    : undefined,
                }}
              >
                {racingNumber}
              </p> */}
            </div>

            <div title="DRS and PIT">
              <div className="text-sm inline-flex h-8 w-full items-center justify-start font-bold gap-2">
                {line.InPit ? (
                  <div className="text-cyan-500">PIT</div>
                ) : line?.PitOut ? (
                  <div className="text-white">OUT</div>
                ) : (
                  <div
                    className={`${carData["45"] === 8 ? "text-gray-400" : ""}
                      ${
                        drsEnabledValues.includes(carData["45"])
                          ? "text-green-500"
                          : ""
                      }
                      ${
                        carData["45"] !== 8 &&
                        !drsEnabledValues.includes(carData["45"])
                          ? "text-gray-700"
                          : ""
                      }`}
                  >
                    DRS
                  </div>
                )}
              </div>
            </div>

            <div title="Tyre">
              <div className="flex flex-row items-center gap-2 place-self-start">
                {currentStint?.Compound &&
                currentStint?.Compound != "UNKNOWN" ? (
                  <img
                    alt={`${currentStint?.Compound}`}
                    loading="lazy"
                    width="32"
                    height="32"
                    decoding="async"
                    src={`/tyres/${currentStint?.Compound}.svg`}
                    style={{ color: " transparent" }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-700 animate-pulse rounded-2xl" />
                )}

                <div>
                  <p className="leading-none text-sm font-light">
                    {currentStint?.TotalLaps ? (
                      <>L {currentStint?.TotalLaps} </>
                    ) : (
                      ""
                    )}
                  </p>
                  <p className="text-xs leading-none text-zinc-500">
                    {line?.NumberOfPitStops ? (
                      <>PIT {line.NumberOfPitStops}</>
                    ) : (
                      <></>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div title="Info">
              <div className="">
                <div className="text-gray-500">
                  {/* {Number(appData?.GridPos) - appData?.Line !== 0 ? (
                    Number(appData?.GridPos) - appData?.Line > 0 ? (
                      <div className="text-green-500">
                        +{Number(appData?.GridPos) - appData?.Line}
                      </div>
                    ) : (
                      <div className="text-red-500">
                        {Number(appData?.GridPos) - appData?.Line}
                      </div>
                    )
                  ) : null} */}
                  {(() => {
                    const gridPos = Number(appData?.GridPos ?? 0);
                    const line = Number(appData?.Line ?? 0);
                    const diff = gridPos - line;
                    if (
                      isFinite(gridPos) &&
                      isFinite(line) &&
                      diff !== 0 &&
                      SessionName === "Race"
                    ) {
                      return diff > 0 ? (
                        <span className="text-zinc-300 inline-flex">
                          <ChevronUp color="#22c55e" size={22} />{" "}
                          {Math.abs(diff)}
                        </span>
                      ) : (
                        <span className="text-zinc-300 inline-flex">
                          <ChevronDown color="#ef4444" size={22} />{" "}
                          {Math.abs(diff)}
                        </span>
                      );
                    }
                    return <span className="text-gray-700">-</span>;
                  })()}
                </div>
                <p className="text-gray-500 leading-none text-[0.7rem]">
                  {line.Retired ? "RETIRED" : line.Stopped ? "STOPPED" : ""}
                </p>
              </div>
            </div>

            <div title="Gap">
              <div className="place-self-start">
                <p
                  className={`text leading-none font-medium ${
                    line?.IntervalToPositionAhead?.Catching
                      ? "text-green-500"
                      : "text-zinc-200"
                  } `}
                >
                  {line?.IntervalToPositionAhead?.Value
                    ? line?.IntervalToPositionAhead?.Value
                    : "---"}
                </p>
                <p className="text-xs text-zinc-500">
                  {line?.GapToLeader ? line?.GapToLeader : "---"}
                </p>
              </div>
            </div>

            <div title="LapTime">
              <div className="place-self-start">
                <p
                  className={`text leading-none font-medium ${
                    line?.LastLapTime?.PersonalFastest
                      ? "text-green-500"
                      : "text-zinc-200"
                  } `}
                >
                  {line?.LastLapTime?.Value}
                </p>
                <p
                  className={`text-xs leading-none  ${
                    TimingStats.Lines[racingNumber]?.PersonalBestLapTime
                      ?.Position === 1
                      ? "text-purple-800"
                      : "text-zinc-500"
                  }`}
                >
                  {line?.BestLapTime?.Value}
                </p>
              </div>
            </div>

            <div title="Sectors">
              <div className="flex gap-2 justify-around">
                {(Array.isArray(line?.Sectors)
                  ? line?.Sectors
                  : Object.values(line?.Sectors ?? {})
                ).map((sector: any, i: number) => {
                  return (
                    <div
                      title={`Sector ${i + 1}`}
                      key={`${line?.RacingNumber} Sector-${i + 1}`}
                      className="flex flex-col gap-1"
                    >
                      <div className="flex flex-row gap-1">
                        {(Array.isArray(sector?.Segments)
                          ? sector?.Segments
                          : Object.values(sector?.Segments ?? {})
                        ).map((segment: any, j: number) => (
                          <div
                            key={`${i}-${j}`}
                            style={{
                              width: "10px",
                              height: "5px",
                              borderRadius: "2px",
                              backgroundColor: getSegmentColor(segment?.Status),
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-1">
                        {sector?.Value ? (
                          <p
                            className={`text leading-none font-medium ${
                              sector?.OverallFastest
                                ? "text-purple-500"
                                : sector?.PersonalFastest
                                ? "text-green-500"
                                : "text-white"
                            }`}
                          >
                            {sector?.Value}
                          </p>
                        ) : (
                          <p style={{ width: "60px" }}></p>
                        )}
                        {TimingStats?.Lines[racingNumber]?.BestSectors && (
                          <p
                            className={`text-xs leading-none ${
                              TimingStats?.Lines[racingNumber]?.BestSectors[i]
                                ?.Position == 1
                                ? "text-purple-800"
                                : "text-zinc-600"
                            }`}
                          >
                            {
                              TimingStats?.Lines[racingNumber]?.BestSectors[i]
                                ?.Value
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div title="Gear/RPM" className="mr-2">
              <div className="flex justify-between">
                <p className="flex h-8 w-8 items-center justify-start text-sm">
                  {carData["3"]}
                </p>
                <p className="flex h-8 w-8 items-center justify-end text-sm">
                  {carData["0"]}
                </p>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-xl bg-zinc-700">
                <div
                  className="h-1.5 bg-blue-500"
                  style={{
                    width: rpmPercent,
                    transition: "all 0.2s linear",
                  }}
                ></div>
              </div>
            </div>

            <div title="Speed">
              <div className="flex justify-start gap-2 mb-2">
                <div className="text-left text-sm leading-none font-medium">
                  {carData["2"]}
                </div>
                <div className="text-xs leading-none text-zinc-600">km/h</div>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-col gap-1">
                  <div className="h-1.5 w-20 overflow-hidden rounded-xl bg-zinc-700">
                    <div
                      className="h-1.5 bg-red-500"
                      style={{
                        width: brakeApplied ? "100%" : "0%",
                        transition: "all 0.1s linear",
                      }}
                    ></div>
                  </div>
                  <div className="h-1.5 w-20 overflow-hidden rounded-xl bg-zinc-700">
                    <div
                      className="h-1.5 bg-green-500"
                      style={{
                        width: throttlePercent,
                        transition: "all 0.1s linear",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
