import * as React from "react";
import {useContext, useEffect} from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Paper,
  styled,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {socket} from "./Instances";
import {WorkspaceTextField} from "./WorkspaceAppBar";
import {getAnalytics, logEvent} from "firebase/analytics";

const analytics = getAnalytics();

const DisableInstall = React.createContext(null);
export const StyledPaper = styled(Paper)`
  background-color: #2a2931;
  background-image: none;
  min-height: calc(100% - 64px);
`;

// Template card component
const Template = props => {
  const [install, setInstall] = React.useState(false);
  const {disableInstall, setDisableInstall} = useContext(DisableInstall);
  return (
    <Card
      style={{
        minWidth: 270,
        flex: `1 0 30%`,
        position: "relative",
      }}>
      <CardContent sx={{mb: "60px"}}>
        <Typography
          sx={{fontSize: 14, wordWrap: "break-word"}}
          color="text.secondary"
          gutterBottom>
          {props.workspaceName}
        </Typography>
        <Typography variant="h5" component="div" sx={{wordWrap: "break-word"}}>
          {props.name}
        </Typography>
        <Typography sx={{mb: 1.5}} color="text.secondary">
          {props.date}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            wordWrap: "break-word",
            maxHeight: "100px",
            overflow: "scroll",
            scrollbarWidth: "none",
          }}>
          {props.description}
        </Typography>
      </CardContent>
      <CardActions>
        {install ? (
          <Box
            sx={{
              width: "calc(100% - 16px)",
              position: "absolute",
              bottom: "16px",
              left: "8px",
            }}>
            <LinearProgress />
          </Box>
        ) : (
          <Button
            sx={{position: "absolute", bottom: "8px", left: "8px"}}
            disabled={disableInstall}
            onClick={() => {
              setInstall(true);
              setDisableInstall(true);
              socket.emit("InstallTemplate", {
                newID: props.instanceId,
                oldID: props.currentID,
              });
              logEvent(analytics, "install_template", {name: props.name});
            }}>
            Install
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

// Template browser that allows users to browse pre-configured workspaces
export default function TemplateBrowser({
  openTBrowser,
  setOpenTBrowser,
  currentID,
}) {
  const [disableInstall, setDisableInstall] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [templates, setTemplates] = React.useState([]);
  const searchParameters = Object.keys(
    Object.assign({}, ...Object.values(templates)),
  );

  // Get up-to-date list of templates
  useEffect(() => {
    socket.on("Templates", templates => {
      setTemplates(templates);
    });
  }, []);

  // Function to search templates
  const search = templates => {
    return templates.filter(template =>
      searchParameters.some(parameter =>
        template[parameter].toString().toLowerCase().includes(query),
      ),
    );
  };

  // Reload page to get access to the new workspace
  socket.on("TemplateInstalled", () => {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        fullWidth
        maxWidth={"md"}
        PaperComponent={StyledPaper}
        open={openTBrowser}
        onClose={() => {
          setOpenTBrowser(false);
        }}
        aria-labelledby="template-browser-dialog-title"
        aria-describedby="template-browser-dialog-description">
        <DialogTitle
          id="template-browser-dialog-title"
          color={"primary.50"}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          {"Template browser"}
          <WorkspaceTextField
            disabled={disableInstall}
            autoFocus
            size={"small"}
            label="Search"
            variant="outlined"
            type={"search"}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
            }}
          />
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="template-browser-dialog-description"
            sx={{color: "#b1b9bc"}}>
            Discover a wide variety of pre-configured workspaces created by the
            Clover Cloud community.
          </DialogContentText>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              mt: "15px",
            }}>
            <DisableInstall.Provider
              value={{
                disableInstall: disableInstall,
                setDisableInstall: setDisableInstall,
              }}>
              {search(templates).map(template => (
                <Template
                  workspaceName={template.workspaceName}
                  name={template.name}
                  description={template.description}
                  date={template.date}
                  key={template.instanceID}
                  instanceId={template.instanceID}
                  currentID={currentID}
                />
              ))}
            </DisableInstall.Provider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenTBrowser(false);
            }}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
