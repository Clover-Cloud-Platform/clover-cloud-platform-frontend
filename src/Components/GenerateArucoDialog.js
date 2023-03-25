import * as React from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {Paper, styled} from "@mui/material";

const StyledPaper = styled(Paper)`
  background-color: #2a2931;
`;
export default function GenerateArucoDialog(props) {
  const [value, setValue] = React.useState(props.value);
  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}
      PaperComponent={StyledPaper}>
      <DialogTitle color={"primary.50"}>Aruco Marker ID</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{color: "rgba(255,255,255,0.7)"}}>
          Please enter the id of the ArUco marker to generate it.
        </DialogContentText>
        <TextField
          sx={{input: {color: "primary.50"}, mt: "10px"}}
          required
          label="ID"
          type="number"
          value={value}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={e => {
            setValue(e.target.value);
          }}
          variant="standard"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.handleClose}>Cancel</Button>
        <Button
          onClick={() => {
            props.generateMarker(value);
          }}>
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
}