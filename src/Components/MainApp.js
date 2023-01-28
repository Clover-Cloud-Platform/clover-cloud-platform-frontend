import * as React from "react";

import {theme} from "../App";
import {ThemeProvider} from "@mui/material/styles";

import ReactSplit, {SplitDirection} from "@devbookhq/splitter";

import Box from "@mui/material/Box";
import CodeEditor from "./Editor";
import "./MainApp.css";
import Terminal from "./Terminal";
import Gazebo from "./Gazebo";
import WorkspaceAppBar from "./WorkspaceAppBar";
import {useSearchParams} from "react-router-dom";
import FileManager from "./FileManager";

export const workspaceTheme = theme;
workspaceTheme.palette.mode = "dark";

export default function MainApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const instanceID = searchParams.get("id");
  return (
    <ThemeProvider theme={workspaceTheme}>
      <Box width={"100%"} height={"100vh"}>
        <WorkspaceAppBar />
        <Box
          width={"100%"}
          style={{height: "calc(100% - 50px)"}}
          bgcolor={"background.cloverMain"}>
          <ReactSplit
            minWidths={[60, 60, 60]}
            initialSizes={[20, 50, 40]}
            direction={SplitDirection.Horizontal}
            draggerClassName={"dragger"}
            gutterClassName={"gutter-horizontal"}>
            <Box height={"100%"} bgcolor={"background.cloverMain"}>
              <FileManager />
            </Box>
            <Box height={"100%"} bgcolor={"#1e1e1e"}>
              <CodeEditor />
            </Box>
            <ReactSplit
              minHeights={[60, 60]}
              direction={SplitDirection.Vertical}
              draggerClassName={"dragger"}
              gutterClassName={"gutter-vertical"}>
              <Gazebo instanceID={instanceID} />
              <Terminal instanceID={instanceID} />
            </ReactSplit>
          </ReactSplit>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
