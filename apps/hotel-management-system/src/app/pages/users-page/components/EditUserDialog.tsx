import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

import Divider from "@mui/material/Divider";
import { ApiResponse, Role, User } from "@hotel-management-system/models";
import { useEffect, useState } from "react";
import { getRoles } from "../../../api/roles";
import { useAppDispatch } from "../../../redux/hooks";
import appStateSlice from "../../../redux/slices/AppStateSlice";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { updateUser } from "../../../api/users";

interface EditUserDialog {
  user: User | null;
  open: boolean;
  setOpen: (open: boolean) => void;
  refreshUsers: () => void;
}

export const EditUserDialog = (props: EditUserDialog) => {
  const [roles, setRoles] = useState([] as Role[]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [position, setPosition] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChangedSomething, setHasChangedSomething] = useState(false);
  const dispatch = useAppDispatch();

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRoleId(event.target.value);
  };

  const resetState = () => {
    //reset all fields
    setFirstName("");
    setLastName("");
    setEmailAddress("");
    setPhoneNumber("");
    setUsername("");
    setPassword("");
    setSelectedRoleId("");
    setPosition("");
  };

  const handleClose = () => {
    // ask user if they want to discard changes
    if (hasChangedSomething) {
      if (window.confirm("Are you sure you want to discard changes?")) {
        resetState();
        props.setOpen(false);
      }
    } else {
      resetState();
      props.setOpen(false);
    }
  };

  const handleAddUser = () => {
    setIsSubmitting(true);
    const newUser: User = {
      userId: props.user?.userId || 0,
      firstName: firstName,
      lastName: lastName,
      email: emailAddress,
      phoneNumber: phoneNumber,
      username: username,
      password: password,
      position: position,
      roleId: parseInt(selectedRoleId),
    };

    // send request to add user
    updateUser(newUser)
      .then((response) => {
        return response.json();
      })
      .then((data: ApiResponse<User>) => {
        if (data.success) {
          props.setOpen(false);
          resetState();
          props.refreshUsers();
          dispatch(
            appStateSlice.actions.setSnackBarAlert({
              show: true,
              message: "User updated successfully",
              severity: "success",
            })
          );
        } else if (!data.success && data.statusCode === 401) {
          dispatch(
            appStateSlice.actions.setSnackBarAlert({
              show: true,
              message: data.message,
              severity: "warning",
            })
          );
        } else {
          dispatch(
            appStateSlice.actions.setSnackBarAlert({
              show: true,
              message: data.message,
              severity: "error",
            })
          );
        }
      })
      .catch(() => {
        dispatch(
          appStateSlice.actions.setSnackBarAlert({
            show: true,
            message: "An unknown error occurred",
            severity: "error",
          })
        );
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  useEffect(() => {
    if (
      firstName !== props.user?.firstName ||
      lastName !== props.user?.lastName ||
      username !== props.user?.username ||
      password !== props.user?.password ||
      phoneNumber !== props.user?.phoneNumber ||
      emailAddress !== props.user?.email ||
      position !== props.user?.position ||
      selectedRoleId !== props.user?.roleId.toString()
    ) {
      setSaveButtonDisabled(false);
      setHasChangedSomething(true);
    } else {
      setSaveButtonDisabled(true);
      setHasChangedSomething(false);
    }
  }, [
    firstName,
    lastName,
    username,
    password,
    selectedRoleId,
    phoneNumber,
    emailAddress,
  ]);

  useEffect(() => {
    getRoles()
      .then((response) => {
        return response.json();
      })
      .then((data: ApiResponse<Role[]>) => {
        if (data.success) {
          setRoles(data.data);
        } else if (!data.success && data.statusCode === 401) {
          dispatch(
            appStateSlice.actions.setSnackBarAlert({
              show: true,
              message: data.message,
              severity: "warning",
            })
          );
        } else {
          dispatch(
            appStateSlice.actions.setSnackBarAlert({
              show: true,
              message: data.message,
              severity: "error",
            })
          );
        }
      })
      .catch(() => {
        dispatch(
          appStateSlice.actions.setSnackBarAlert({
            show: true,
            message: "An unknown error occurred",
            severity: "error",
          })
        );
      });
  }, []);

  useEffect(() => {
    setFirstName(props.user?.firstName || "");
    setLastName(props.user?.lastName || "");
    setEmailAddress(props.user?.email || "");
    setPhoneNumber(props.user?.phoneNumber || "");
    setUsername(props.user?.username || "");
    setPassword(props.user?.password || "");
    setPosition(props.user?.position || "");
    setSelectedRoleId(props.user?.roleId.toString() || "");
  }, [props.user, props.open]);

  return (
    <Dialog open={props.open} fullWidth>
      <DialogTitle>
        Editing {props.user?.firstName} {props.user?.lastName}
      </DialogTitle>
      <Divider />
      <IconButton
        aria-label="close"
        onClick={handleClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent>
        <Stack gap={2}>
          <Typography variant={"body1"}>
            Update user details below. The first name, last name, username,
            password and role fields are required.
          </Typography>
          <Typography variant={"subtitle2"}>User Details</Typography>
          <Stack direction={"row"} gap={"inherit"}>
            <TextField
              fullWidth
              required
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              fullWidth
              required
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Stack>
          <TextField
            fullWidth
            label="Email Address"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <TextField
            fullWidth
            label="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Divider />
          <Typography variant={"subtitle2"}>Account Details</Typography>
          <TextField
            fullWidth
            required
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            required
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormControl fullWidth required>
            <InputLabel id="demo-simple-select-label">Role</InputLabel>
            <Select
              label="Role"
              value={selectedRoleId}
              onChange={handleRoleChange}
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.roleId} value={role.roleId}>
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant={"contained"}
            color={"primary"}
            startIcon={<EditIcon />}
            disabled={saveButtonDisabled || isSubmitting}
            onClick={handleAddUser}
          >
            {isSubmitting ? "Updating user..." : "Edit User"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};