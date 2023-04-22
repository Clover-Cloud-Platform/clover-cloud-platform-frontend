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

const DisableInstall = React.createContext(null);

const StyledPaper = styled(Paper)`
  background-color: #2a2931;
  background-image: none;
  min-height: calc(100% - 64px);
`;

const Template = props => {
  const [install, setInstall] = React.useState(false);
  const {disableInstall, setDisableInstall} = useContext(DisableInstall);
  return (
    <Card
      style={{
        minWidth: 270,
        flex: `1 0 30%`,
      }}>
      <CardContent>
        <Typography sx={{fontSize: 14}} color="text.secondary" gutterBottom>
          {props.workspaceName}
        </Typography>
        <Typography variant="h5" component="div">
          {props.name}
        </Typography>
        <Typography sx={{mb: 1.5}} color="text.secondary">
          {props.date}
        </Typography>
        <Typography variant="body2">{props.description}</Typography>
      </CardContent>
      <CardActions>
        {install ? (
          <Box
            sx={{
              width: "100%",
            }}>
            <LinearProgress sx={{mt: "25px"}} />
          </Box>
        ) : (
          <Button
            disabled={disableInstall}
            onClick={() => {
              setInstall(true);
              setDisableInstall(true);
              socket.emit("InstallTemplate", {
                newID: props.instanceId,
                oldID: props.currentID,
              });
            }}>
            Install
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

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

  useEffect(() => {
    socket.on("Templates", templates => {
      setTemplates(templates);
    });
  }, []);

  const search = templates => {
    return templates.filter(template =>
      searchParameters.some(parameter =>
        template[parameter].toString().toLowerCase().includes(query),
      ),
    );
  };

  socket.on("TemplateInstalled", () => {
    window.location.reload();
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
