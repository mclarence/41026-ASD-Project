import { Reservation } from "@hotel-management-system/models"

export const getReservations = async (): Promise<Response> => {
    return fetch('/api/reservations', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
    })
}

export const createReservation = async (reservation: Reservation): Promise<Response> => {
    return fetch('/api/reservations/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify(reservation)
    })
}

export const searchReservations = async (searchQueries: {
    startDate?: Date,
    endDate?: Date,
    guestId?: number,
}): Promise<Response> => {
    // add query params to url. do not add if the query param is null or undefined
    let url = `/api/reservations/search?`
    if (searchQueries.startDate) {
        url += `startDate=${searchQueries.startDate}&`
    }

    if (searchQueries.endDate) {
        url += `endDate=${searchQueries.endDate}&`
    }

    if (searchQueries.guestId) {
        url += `guestId=${searchQueries.guestId}&`
    }

    return fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
    })
}