import React from "react";
import { Composition } from "remotion";
import { NodesIntro } from "./NodesAd";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NodesIntro"
        component={NodesIntro}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
