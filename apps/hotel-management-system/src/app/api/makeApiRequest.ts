import {ThunkDispatch} from "@reduxjs/toolkit";
import appStateSlice from "../redux/slices/AppStateSlice";
import {ApiResponse} from "@hotel-management-system/models";

/**
 * Makes an api request
 * @param response A promise that resolves to a response
 * @param dispatch The dispatch function from redux
 * @param onSuccess A function that is called when the request is successful
 */
export const makeApiRequest = <T>(
    response: Promise<Response>,
    dispatch: ThunkDispatch<any, any, any>,
    onSuccess: (data: T) => void,
) => {
    response
    .then((response) => {
        return response.json();
      })
      .then((data: ApiResponse<T>) => {
        if (data.success) {
            onSuccess(data.data);
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
}