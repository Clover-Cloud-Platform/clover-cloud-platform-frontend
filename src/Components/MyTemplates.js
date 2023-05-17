import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {ThemeProvider} from "@mui/material/styles";
import {theme} from "../App";
import {socket} from "./Instances";
import {StyledPaper} from "./TemplateBrowser";

// Component that displays user's templates
export default function MyTemplates({
  openMyTemplates,
  setOpenMyTemplates,
  myTemplates,
  setMyTemplates,
  uid,
}) {
  const Template = props => {
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
          <Button
            onClick={() => {
              socket.emit("DeleteTemplate", {
                instanceID: props.instanceId,
                uid: uid,
              });
              const myTemplatesUpdated = myTemplates;
              myTemplatesUpdated.splice(props.index, 1);
              setMyTemplates([...myTemplatesUpdated]);
            }}>
            Delete
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        fullWidth
        maxWidth={"md"}
        PaperComponent={StyledPaper}
        open={openMyTemplates}
        onClose={() => {
          setOpenMyTemplates(false);
        }}
        aria-labelledby="my-templates-dialog-title">
        <DialogTitle
          id="my-templates-dialog-title"
          color={"primary.50"}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
          {"My Templates"}
        </DialogTitle>
        <DialogContent sx={{position: "relative"}}>
          {myTemplates.length === 0 ? (
            <Typography
              color={"text.secondary"}
              sx={{
                fontSize: "24px",
                position: "absolute",
                top: "50%",
                transform: "translate(-50%, -50%)",
                left: "50%",
              }}>
              You have no templates.
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                mt: "15px",
              }}>
              {myTemplates.map(template => (
                <Template
                  workspaceName={template.workspaceName}
                  name={template.name}
                  description={template.description}
                  date={template.date}
                  key={template.instanceID}
                  instanceId={template.instanceID}
                  index={myTemplates.indexOf(template)}
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenMyTemplates(false);
            }}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
