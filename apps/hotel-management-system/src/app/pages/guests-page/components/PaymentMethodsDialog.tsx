import {Dialog, DialogContent, SpeedDial} from "@mui/material";
import {DialogHeader} from "../../../../util/DialogHeader";
import {ApiResponse, Guest, PaymentMethod} from "@hotel-management-system/models";
import {useEffect, useRef, useState} from "react";
import {DataGrid} from "@mui/x-data-grid";
import AddCardIcon from '@mui/icons-material/AddCard';
import {AddPaymentMethodDialog} from "./AddPaymentMethodDialog";
import {getPaymentMethodsByGuestId} from "../../../api/paymentMethods";
import appStateSlice from "../../../redux/slices/AppStateSlice";
import {useAppDispatch} from "../../../redux/hooks";

export const PaymentMethodsDialog = (props: {
    open: boolean,
    setOpen: (open: boolean) => void,
    guest: Guest | null
}) => {
    const dispatch = useAppDispatch();
    const [openAddPaymentMethodDialog, setOpenAddPaymentMethodDialog] = useState<boolean>(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [tableLoading, setTableLoading] = useState(false);
    const columns = useRef([
        {field: "paymentMethodId", headerName: "ID", width: 100},
        {field: "type", headerName: "Type", width: 200},
        {field: "cardNumber", headerName: "Card Number", width: 200},
        {field: "cardCvv", headerName: "Card CVV", width: 200},
        {field: "cardExpiration", headerName: "Card Expiration Date", width: 200},
        {field: "cardHolderName", headerName: "Card Holder Name", width: 200},
        {field: "bankAccountNumber", headerName: "Bank Account Number", width: 200},
        {field: "bankBsb", headerName: "BSB", width: 200},
    ])

    const getPaymentMethods = () => {
        if (props.guest) {
            setTableLoading(true)
            getPaymentMethodsByGuestId(props.guest.guestId!)
                .then((response) => {
                    return response.json();
                })
                .then((data: ApiResponse<PaymentMethod[]>) => {
                    if (data.success) {
                        setPaymentMethods(data.data);
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
                    setTableLoading(false);
                });
        }
    }

    useEffect(() => {
        getPaymentMethods();
    }, [props.guest, props.open]);

    return (
        <>
            <AddPaymentMethodDialog
                open={openAddPaymentMethodDialog}
                setOpen={setOpenAddPaymentMethodDialog}
                guest={props.guest}
                fetchPaymentMethods={getPaymentMethods}
            />
            <Dialog open={props.open} fullWidth fullScreen>
                <DialogHeader title={`Viewing payment methods for: ${props.guest?.firstName} ${props.guest?.lastName}`}
                              onClose={() => props.setOpen(false)}/>
                <DialogContent sx={{padding: 2}}>
                    <DataGrid columns={columns.current}
                              rows={paymentMethods}
                              loading={tableLoading}
                              getRowId={(row) => row.paymentMethodId!}
                    />
                </DialogContent>
                <SpeedDial
                    ariaLabel="SpeedDial basic example"
                    sx={{position: "fixed", bottom: 90, right: 32}}
                    onClick={() => {
                        setOpenAddPaymentMethodDialog(true);
                    }}
                    icon={<AddCardIcon/>}
                ></SpeedDial>
            </Dialog>
        </>
    )
}