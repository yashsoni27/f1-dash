import { getConstructorHex } from "@/lib/utils";
import { Evolutions, RankingEvolutionProps } from "@/types";
import { ResponsiveBump } from "@nivo/bump";
import { chartTheme } from "./StandingEvolution";
import { CircleAlert } from "lucide-react";

function transformData(rankings: Evolutions) {
  const transformedData = [];

  if (rankings?.driversEvolution) {
    for (const driver of rankings.driversEvolution) {
      const driverSeries: {
        id: string;
        data: {
          x: string | number;
          y: number | null;
          locality: string | undefined;
        }[];
        name: string;
        constructorId: string;
      } = {
        id: driver.code,
        data: [],
        name: driver.name,
        constructorId: driver.constructorId,
      };

      for (let i = 0; i < driver.rounds.length; i++) {
        driverSeries.data.push({
          x: i + 1 == driver.rounds[i].round ? i + 1 : driver.rounds[i].round,
          y: driver.rounds[i].position,
          locality: driver.rounds[i].locality || undefined,
        });
      }

      transformedData.push(driverSeries);
    }
  }

  if (rankings?.constructorsEvolution) {
    for (const constructor of rankings.constructorsEvolution) {
      const constructorSeries: {
        id: string;
        data: { x: string | number; y: number; locality: string | undefined }[];
        constructorId: string;
        name: string;
      } = {
        id: constructor.name,
        name: constructor.name,
        data: [],
        constructorId: constructor.constructorId,
      };

      for (let i = 0; i < constructor.rounds.length; i++) {
        constructorSeries.data.push({
          x: constructor.rounds[i].round,
          y: constructor.rounds[i].position,
          locality: constructor.rounds[i].locality || undefined,
        });
      }

      transformedData.push(constructorSeries);
    }
  }

  return transformedData;
}

const RankingEvolution = ({ title, rankings }: RankingEvolutionProps) => {
  const data = transformData(rankings);

  const getColor = (series: { constructorId: string }) => {
    return getConstructorHex(series.constructorId);
  };

  const CustomTooltip = ({ point }: any) => {
    return (
      <div
        className="bg-slate-800 rounded-md min-w-[150px] opacity-95"
        style={{
          fontSize: "10px",
          fontWeight: "light",
        }}
      >
        <div className="mb-2 p-2 border-b border-slate-600">
          {point.data.locality}
        </div>
        <div className="flex justify-between items-center pb-2 px-2">
          <div className="pr-2">{point.serie.data.name}</div>
          <div style={{ color: point.color }}>
            {point.data.y}
            <sup>th</sup> pos
          </div>
        </div>
      </div>
    );
  };

  const hasNoData =
    (rankings?.driversEvolution?.length === 0 || !rankings?.driversEvolution) &&
    (rankings?.constructorsEvolution?.length === 0 ||
      !rankings?.constructorsEvolution);

  return (
    <>
      <div className="mb-3">{title} Ranking Evolution</div>
      {hasNoData ? (
        <div className="h-full flex justify-center items-center text-gray-500">
          <CircleAlert />
          &nbsp;&nbsp;Not Available
        </div>
      ) : (
        <ResponsiveBump
          data={data}
          margin={
            title == "Drivers"
              ? { top: 0, right: 40, bottom: 20, left: 22 }
              : { top: 0, right: 90, bottom: 20, left: 22 }
          }
          endLabelPadding={10}
          xPadding={0.6}
          xOuterPadding={0.3}
          interpolation="smooth"
          pointSize={4}
          inactivePointSize={1}
          axisTop={null}
          axisRight={null}
          theme={chartTheme}
          colors={getColor}
          useMesh={true}
          animate={true}
          motionConfig={"slow"}
          enableGridY={false}
          enableGridX={false}
          pointTooltip={CustomTooltip}
        />
      )}
    </>
  );
};

export default RankingEvolution;
