import React, { useEffect } from 'react';
import { useAppDispatch } from "../../redux/hooks";
import HotelDashboard from './HotelDashboard'; 


export const Dashboard = () => {

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(appStateSlice.actions.setAppBarTitle('Dashboard'));
    }, []);

    return (
            <HotelDashboard />
    )
}
