import * as React from "react";
import {useEffect} from "react";
import {workspaceTheme} from "./MainApp";
import {ThemeProvider} from "@mui/material/styles";
import {
  getMaterialFileIcon,
  getMaterialFolderIcon,
} from "file-extension-icon-js";
import Box from "@mui/material/Box";
import SettingsBackupRestoreRoundedIcon from "@mui/icons-material/SettingsBackupRestoreRounded";
import Typography from "@mui/material/Typography";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import {Alert, Snackbar, Tooltip} from "@mui/material";
import CreateNewFolderOutlinedIcon from "@mui/icons-material/CreateNewFolderOutlined";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {DndProvider, useDrag, useDrop} from "react-dnd";
import {HTML5Backend} from "react-dnd-html5-backend";
import EditMenu from "./EditMenu";
import TextField from "@mui/material/TextField";
import {socket} from "./Instances";

let filesReceived = false;
let data = [];
export default function FileManager({
  onDragToEditor,
  instanceID,
  onLoadManager,
}) {
  const [fileTree, setFileTree] = React.useState();

  useEffect(() => {
    socket.emit("GetFiles", instanceID);
  }, []);
  socket.on("Files", files => {
    if (!filesReceived) {
      data = files;
      setFileTree(<FileTree data={files} />);
      filesReceived = true;
      onLoadManager();
    }
  });

  const [openErrorFile, setOpenErrorFile] = React.useState(false);
  const [openErrorFolder, setOpenErrorFolder] = React.useState(false);

  const editTree = (source, targetDir, operation, newName = "") => {
    const newData = data;
    function traverse(o, fn) {
      for (const k in o) {
        const res = fn.apply(this, [o, k]);
        if (res) {
          return res;
        }
        if (o[k] !== null && typeof o[k] == "object") {
          const res = traverse(o[k], fn);
          if (res) return res;
        }
      }
    }
    const splice_source = (obj, predicate) =>
      traverse(obj, (o, k) => {
        let m_index = -1;
        if (Array.isArray(o[k])) {
          m_index = o[k].findIndex(o => predicate(o, k));
        }
        return m_index !== -1 ? o[k].splice(m_index, 1)[0] : false;
      });

    const find_target_array = (obj, predicate) =>
      traverse(obj, (o, k) => (predicate(o, k) ? o.children : false));

    let source_object;
    let move = true;
    if (typeof source === "string") {
      source_object = splice_source(newData, obj => obj?.path === source);
      if (!source_object) {
        source_object = newData.splice(
          newData.indexOf(newData.filter(el => el.path === source)),
          1,
        )[0];
      }
    } else if (typeof source === "object") {
      source_object = source;
      move = false;
    }
    if (operation === "move") {
      const target_array = find_target_array(
        newData,
        obj => obj?.path === targetDir,
      );
      if (
        (source_object.type === "file" &&
          target_array.filter(
            file => file.type === "file" && file.name === source_object.name,
          )[0]) ||
        (source_object.type === "folder" &&
          target_array.filter(
            folder =>
              folder.type === "folder" && folder.name === source_object.name,
          )[0])
      ) {
        if (!move) {
          if (source_object.type === "file") {
            setOpenErrorFile(true);
          } else {
            setOpenErrorFolder(true);
          }
        }
      } else {
        target_array.push(source_object);
      }
    } else if (operation === "edit") {
      let newSource = source_object;
      const oldPath = source_object.path;
      newSource.name = newName;
      newSource.path = `${targetDir}/${newName}`;
      const replacePath = array => {
        for (const i in array) {
          array[i].path = array[i].path.replace(oldPath, newSource.path);
          if (array[i].children) {
            replacePath(array[i].children);
          }
        }
        return array;
      };
      if (newSource.type === "folder") {
        newSource = replacePath(newSource.children);
      }
      const target_array = find_target_array(
        newData,
        obj => obj?.path === targetDir,
      );
      target_array.push(source_object);
    }
    return <FileTree data={newData} />;
  };

  const Directory = props => {
    const [open, setOpen] = React.useState(false);
    const [showActions, setShowActions] = React.useState("none");
    const [inputValue, setInputValue] = React.useState("");
    const path = props.path;
    const [{canDrop, isOver}, drop] = useDrop(() => ({
      accept: ["file", "folder"],
      drop: () => ({name: path}),
      collect: monitor => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }));
    const [{isDragging}, drag] = useDrag(() => ({
      item: {path},
      type: "folder",
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();
        if (item && dropResult) {
          if (item.path !== dropResult.name) {
            socket.emit("MoveItem", {
              source: item.path,
              target: dropResult.name,
              instanceID: instanceID,
            });
            setFileTree(editTree(item.path, dropResult.name, "move"));
            console.log(`dropped ${item.path} into ${dropResult.name}`);
          }
        }
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
        handlerId: monitor.getHandlerId(),
      }),
    }));

    const root = path === "/FILES";

    const [anchorElAddFile, setAnchorElAddFile] = React.useState(null);
    const openAddFile = Boolean(anchorElAddFile);
    const handleClickAddFile = event => {
      setInputValue("");
      setAnchorElAddFile(event.currentTarget);
    };
    const handleCloseAddFile = () => {
      setAnchorElAddFile(null);
    };
    const [anchorElAddFolder, setAnchorElAddFolder] = React.useState(null);
    const openAddFolder = Boolean(anchorElAddFolder);
    const handleClickAddFolder = event => {
      setInputValue("");
      setAnchorElAddFolder(event.currentTarget);
    };
    const handleCloseAddFolder = () => {
      setAnchorElAddFolder(null);
    };
    const [anchorElEdit, setAnchorElEdit] = React.useState(null);
    const openEdit = Boolean(anchorElEdit);
    const handleClickEdit = event => {
      setInputValue("");
      setAnchorElEdit(event.currentTarget);
    };
    const handleCloseEdit = () => {
      setAnchorElEdit(null);
    };

    const addNewFile = () => {
      if (inputValue.trim() !== "") {
        console.log(
          "new file",
          inputValue.trim(),
          `${path}/${inputValue.trim()}`,
        );
        socket.emit("CreateNewFile", {
          path: `${path}/${inputValue.trim()}`,
          instanceID: instanceID,
        });
        setFileTree(
          editTree(
            {
              type: "file",
              name: inputValue.trim(),
              path: `${path}/${inputValue.trim()}`,
            },
            path,
            "move",
          ),
        );
      }
    };
    const addNewDir = () => {
      if (inputValue.trim() !== "") {
        console.log(
          "new dir",
          inputValue.trim(),
          `${path}/${inputValue.trim()}`,
        );
        socket.emit("CreateNewDirectory", {
          path: `${path}/${inputValue.trim()}`,
          instanceID: instanceID,
        });
        setFileTree(
          editTree(
            {
              type: "folder",
              name: inputValue.trim(),
              path: `${path}/${inputValue.trim()}`,
              children: [],
            },
            path,
            "move",
          ),
        );
      }
    };
    const editName = () => {
      socket.emit("EditName", {
        path: path,
        newName: inputValue.trim(),
        instanceID: instanceID,
      });
      setFileTree(
        editTree(
          path,
          path.slice(0, path.lastIndexOf("/")),
          "edit",
          inputValue.trim(),
        ),
      );
    };

    const deleteItem = () => {
      socket.emit("DeleteDirectory", {path: path, instanceID: instanceID});
      setFileTree(editTree(path, "", "delete"));
    };
    return (
      <>
        <Box
          position={"relative"}
          ref={el => {
            drag(el);
            drop(el);
          }}
          height={"30px"}
          width={"100%"}
          onMouseOver={() => {
            setShowActions("flex");
          }}
          onMouseOut={() => {
            if (!openAddFile && !openAddFolder && !openEdit) {
              setShowActions("none");
            }
          }}
          sx={{
            "&:hover": {bgcolor: "background.cloverAppBar"},
            bgcolor:
              canDrop && isOver
                ? "background.cloverAppBar"
                : "background.cloverMain",
            cursor: "pointer",
          }}>
          <Box
            ml={`${props.level * 10}px`}
            onClick={() => {
              setOpen(prev => !prev);
            }}
            display={"flex"}
            gap={"7px"}
            alignItems={"center"}
            height={"30px"}>
            <ArrowForwardIosRoundedIcon
              sx={{
                color: "primary.50",
                width: "18px",
                transform: `rotate(${open ? "90deg" : "0deg"})`,
                transition: "transform 0.1s",
              }}
            />
            <img
              src={getMaterialFolderIcon(props.name)}
              alt={props.name}
              width="18px"
              height={"18px"}
            />
            <Typography
              color={"#b0b1b2"}
              sx={{
                fontSize: "14px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "50%",
              }}>
              {props.name}
            </Typography>
          </Box>
          <Box
            position={"absolute"}
            top={0}
            right={"2px"}
            gap={"4px"}
            alignItems={"center"}
            height={"30px"}
            display={showActions}>
            <NoteAddOutlinedIcon
              aria-haspopup="true"
              onClick={handleClickAddFile}
              sx={{
                fontSize: "18px",
                color: "rgba(176,177,178,0.5)",
                "&:hover": {color: "#b0b1b2"},
              }}
            />
            <CreateNewFolderOutlinedIcon
              aria-haspopup="true"
              onClick={handleClickAddFolder}
              sx={{
                fontSize: "18px",
                color: "rgba(176,177,178,0.5)",
                "&:hover": {color: "#b0b1b2"},
              }}
            />
            {root ? (
              <div></div>
            ) : (
              <EditOutlinedIcon
                aria-haspopup="true"
                onClick={handleClickEdit}
                sx={{
                  fontSize: "18px",
                  color: "rgba(176,177,178,0.5)",
                  "&:hover": {color: "#b0b1b2"},
                }}
              />
            )}
            {root ? (
              <></>
            ) : (
              <DeleteOutlinedIcon
                onClick={deleteItem}
                sx={{
                  fontSize: "18px",
                  color: "rgba(176,177,178,0.5)",
                  "&:hover": {color: "#b0b1b2"},
                }}
              />
            )}
            <EditMenu
              anchorEl={anchorElAddFile}
              open={openAddFile}
              onClose={handleCloseAddFile}>
              <TextField
                onChange={e => {
                  setInputValue(e.target.value);
                }}
                onKeyDown={k => {
                  if (k.key === "Enter") {
                    addNewFile();
                    handleCloseAddFile();
                  }
                }}
                placeholder={"New file"}
                size="small"
                variant={"standard"}
                sx={{input: {color: "primary.50"}}}
              />
            </EditMenu>
            <EditMenu
              anchorEl={anchorElAddFolder}
              open={openAddFolder}
              onClose={handleCloseAddFolder}>
              <TextField
                onChange={e => {
                  setInputValue(e.target.value);
                }}
                onKeyDown={k => {
                  if (k.key === "Enter") {
                    addNewDir();
                    handleCloseAddFolder();
                  }
                }}
                placeholder={"New directory"}
                size="small"
                variant={"standard"}
                sx={{input: {color: "primary.50"}}}
              />
            </EditMenu>
            <EditMenu
              anchorEl={anchorElEdit}
              open={openEdit}
              onClose={handleCloseEdit}>
              <TextField
                onChange={e => {
                  setInputValue(e.target.value);
                }}
                onKeyDown={k => {
                  if (k.key === "Enter") {
                    editName();
                    handleCloseEdit();
                  }
                }}
                placeholder={"New name"}
                size="small"
                variant={"standard"}
                sx={{input: {color: "primary.50"}}}
              />
            </EditMenu>
          </Box>
        </Box>
        <Box display={open ? "visible" : "none"}>{props.children}</Box>
      </>
    );
  };

  const File = props => {
    const name = props.name;
    const path = props.path;
    const [showActions, setShowActions] = React.useState("none");
    const [inputValue, setInputValue] = React.useState("");
    const [{isDragging}, drag] = useDrag(() => ({
      item: {path},
      type: "file",
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();
        if (item && dropResult) {
          if (dropResult.name === "CodeEditor") {
            console.log("editor");
            onDragToEditor(item.path);
          } else {
            socket.emit("MoveItem", {
              source: item.path,
              target: dropResult.name,
              instanceID: instanceID,
            });
            setFileTree(editTree(item.path, dropResult.name, "move"));
            console.log(`dropped ${item.path} into ${dropResult.name}`);
          }
        }
      },
      collect: monitor => ({
        isDragging: monitor.isDragging(),
        handlerId: monitor.getHandlerId(),
      }),
    }));

    const [anchorElEdit, setAnchorElEdit] = React.useState(null);
    const openEdit = Boolean(anchorElEdit);
    const handleClickEdit = event => {
      setInputValue("");
      setAnchorElEdit(event.currentTarget);
    };
    const handleCloseEdit = () => {
      setAnchorElEdit(null);
    };
    const editName = () => {
      socket.emit("EditName", {
        path: path,
        newName: inputValue.trim(),
        instanceID: instanceID,
      });
      setFileTree(
        editTree(
          path,
          path.slice(0, path.lastIndexOf("/")),
          "edit",
          inputValue.trim(),
        ),
      );
    };

    const deleteItem = () => {
      socket.emit("DeleteFile", {path: path, instanceID: instanceID});
      setFileTree(editTree(path, "", "delete"));
    };
    return (
      <Box
        position={"relative"}
        ref={drag}
        height={"30px"}
        width={"100%"}
        onMouseOver={() => {
          setShowActions("flex");
        }}
        onMouseOut={() => {
          setShowActions("none");
        }}
        sx={{
          "&:hover": {bgcolor: "background.cloverAppBar"},
          cursor: "pointer",
        }}>
        <Box
          onClick={() => {
            onDragToEditor(path);
          }}
          display={"flex"}
          gap={"7px"}
          alignItems={"center"}
          height={"30px"}
          width={"100%"}>
          <img
            style={{marginLeft: `${props.level * 10 + 25}px`}}
            src={getMaterialFileIcon(name)}
            alt={name}
            width="18px"
            height={"18px"}
          />
          <Typography
            color={"#b0b1b2"}
            sx={{
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "70%",
            }}>
            {name}
          </Typography>
        </Box>
        <Box
          position={"absolute"}
          top={0}
          right={"2px"}
          gap={"4px"}
          alignItems={"center"}
          height={"30px"}
          display={showActions}>
          <EditOutlinedIcon
            aria-haspopup="true"
            onClick={handleClickEdit}
            sx={{
              fontSize: "18px",
              color: "rgba(176,177,178,0.5)",
              "&:hover": {color: "#b0b1b2"},
            }}
          />
          <DeleteOutlinedIcon
            onClick={deleteItem}
            sx={{
              fontSize: "18px",
              color: "rgba(176,177,178,0.5)",
              "&:hover": {color: "#b0b1b2"},
            }}
          />
          <EditMenu
            anchorEl={anchorElEdit}
            open={openEdit}
            onClose={handleCloseEdit}>
            <TextField
              onChange={e => {
                setInputValue(e.target.value);
              }}
              onKeyDown={k => {
                if (k.key === "Enter") {
                  editName();
                  handleCloseEdit();
                }
              }}
              placeholder={"New name"}
              size="small"
              variant={"standard"}
              sx={{input: {color: "primary.50"}}}
            />
          </EditMenu>
        </Box>
      </Box>
    );
  };

  const FileTree = ({data}) => {
    let level;
    if (data[0]) {
      level = data[0].path.split("/").length - 1;
    }
    return data.map(item => {
      if (item) {
        if (item.type === "file") {
          return (
            <File
              name={item.name}
              level={level}
              key={item.path}
              path={item.path}
            />
          );
        }
        if (item.type === "folder") {
          return (
            <Directory
              name={item.name}
              level={level}
              key={item.path}
              path={item.path}>
              <FileTree data={item.children} />
            </Directory>
          );
        }
      }
    });
  };

  return (
    <ThemeProvider theme={workspaceTheme}>
      <Box display={"flex"} flexDirection={"column"}>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          height={"50px"}
          pl={"10px"}
          pr={"10px"}>
          <Typography variant={"overline"} color={"#7c8186"}>
            workspace
          </Typography>
          <Tooltip
            title={"Revert instance to its initial state"}
            disableInteractive>
            <SettingsBackupRestoreRoundedIcon
              fontSize={"small"}
              sx={{
                color: "#7c8186",
                "&:hover": {color: "primary.50"},
                cursor: "pointer",
              }}
            />
          </Tooltip>
        </Box>
        <DndProvider backend={HTML5Backend}>{fileTree}</DndProvider>
        <Snackbar
          open={openErrorFile}
          autoHideDuration={4000}
          onClose={() => {
            setOpenErrorFile(false);
          }}>
          <Alert
            onClose={() => {
              setOpenErrorFile(false);
            }}
            severity="error"
            sx={{width: "100%"}}>
            A file with that name already exists!
          </Alert>
        </Snackbar>
        <Snackbar
          open={openErrorFolder}
          autoHideDuration={4000}
          onClose={() => {
            setOpenErrorFolder(false);
          }}>
          <Alert
            onClose={() => {
              setOpenErrorFolder(false);
            }}
            severity="error"
            sx={{width: "100%"}}>
            A folder with that name already exists!
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
