import express from "express";
import {IReservationDAO} from "../database/reservations";
import {IAuthenticationMiddleware} from "../middleware/authentication";
import {IAuthorizationMiddleware} from "../middleware/authorization";
import sendResponse from "../util/sendResponse";
import {StatusCodes} from "http-status-codes";
import Joi from "joi";
import {Reservation} from "@hotel-management-system/models"
import {IGuestDAO} from "../database/guests";
import {IRoomsDAO} from "../database/rooms";
import {ReservationStatuses} from "../../../../libs/models/src/lib/enums/ReservationStatuses";

interface IReservationsRoute {
    router: express.Router
}

export const makeReservationsRoute = (
    reservationsDAO: IReservationDAO,
    guestsDAO: IGuestDAO,
    roomsDAO: IRoomsDAO,
    authentication: IAuthenticationMiddleware,
    authorization: IAuthorizationMiddleware,
): IReservationsRoute => {
    const router = express.Router();

    const {
        getReservations,
        getReservationById,
        createReservation,
        checkReservationExistsById,
        updateReservation,
        deleteReservation,
        getReservationsByGuestId,
        checkIfReservationIsAvailable
    } = reservationsDAO

    const {
        checkGuestExistsById
    } = guestsDAO

    const {
        checkRoomExistsById
    } = roomsDAO

    /**
     * Get all reservations
     */
    router.get("/", authentication, authorization("reservations.read"), async (req: express.Request, res: express.Response) => {
        try {
            const reservations = await getReservations();
            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Reservations fetched successfully",
                data: reservations,
            })
        } catch (err) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to fetch reservations",
                data: err.message,
            })
        }
    })
    router.get("/search", authentication, authorization("reservations.read"), async (req: express.Request, res: express.Response) => {
        try {
            const db = reservationsDAO.getDb();

            const {
                startDate,
                endDate,
                guestId
            } = req.query;
            
            let query = 'SELECT * FROM reservations WHERE 1=1 '
            const params = {}

            if (startDate) {
                const startDateParam = new Date(startDate as string);
                query += 'AND start_date >= $/startDate/ '
                params['startDate'] = startDateParam;
            }

            if (endDate) {
                const endDateParam = new Date(endDate as string);
                query += 'AND end_date <= $/endDate/ '
                params['endDate'] = endDateParam;
            }

            if (guestId) {
                // check if the guest exists
                const parsedGuestId = parseInt(guestId as string);

                if (isNaN(parsedGuestId)) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.BAD_REQUEST,
                        message: "Invalid guest id",
                        data: null,
                    })
                }

                const guestExists = await checkGuestExistsById(parsedGuestId);

                if (!guestExists) {
                    return sendResponse(res, {
                        success: false,
                        statusCode: StatusCodes.NOT_FOUND,
                        message: "Guest not found",
                        data: null,
                    })
                }

                query += 'AND guest_id = $/guestId/ '
                params['guestId'] = guestId;
            }

            // check if any query is provided
            if (Object.keys(params).length === 0) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid query",
                    data: null,
                })
            }

            const reservations = await db.any(query, params);

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Reservations fetched successfully",
                data: reservations,
            })


        } catch (err) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to fetch reservations",
                data: err.message,
            })
        }
    })

    /**
     * Get reservation by id
     */
    router.get("/:reservationId", authentication, authorization("reservations.read"), async (req, res) => {
        try {
            const reservationId = parseInt(req.params.reservationId);

            if (isNaN(reservationId)) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid reservation id",
                    data: null
                })
            }

            const reservation = await getReservationById(reservationId);

            if (reservation === null) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Reservation not found",
                    data: null
                })
            }

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Reservation fetched successfully",
                data: reservation,
            })
        } catch (err) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to fetch reservation",
                data: err.message,
            })
        }
    })

    /**
     * Create reservation
     */
    router.post("/add", authentication, authorization("reservations.create"), async (req, res) => {
        try {
            const schema = Joi.object({
                reservationId: Joi.number().optional(),
                roomId: Joi.number().required(),
                guestId: Joi.number().required(),
                startDate: Joi.date().required(),
                endDate: Joi.date().required(),
                checkInDate: Joi.date().optional(),
                checkOutDate: Joi.date().optional(),
                reservationStatus: Joi.string().optional().valid(...Object.values(ReservationStatuses))
            })

            const { error } = schema.validate(req.body);

            if (error) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: error.message,
                    data: null,
                })
            }

            // check if the guest exists
            const guestExists = await checkGuestExistsById(req.body.guestId);

            if (!guestExists) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Guest not found",
                    data: null,
                })
            }

            // check if the room exists
            const roomExists = await checkRoomExistsById(req.body.roomId);

            if (!roomExists) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Room not found",
                    data: null,
                })
            }
            console.log(req.body.startDate, req.body.endDate)
            //check if reservation is available
            const isAvailable = await checkIfReservationIsAvailable(req.body.roomId, new Date(req.body.startDate), new Date(req.body.endDate));

            if (!isAvailable) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Room is not available for the given dates",
                    data: null,
                })
            }

            const reservation:Reservation = {
                reservationId: req.body.reservationId,
                roomId: req.body.roomId,
                guestId: req.body.guestId,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                checkInDate: req.body.checkInDate,
                checkOutDate: req.body.checkOutDate,
                reservationStatus: req.body.reservationStatus
            }

            const newReservation = await createReservation(reservation);

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Reservation created successfully",
                data: newReservation,
            })

        } catch (err) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to create reservation",
                data: err,
            })
        }
    })

    /**
     * Update reservation
     */
    router.patch("/:reservationId", authentication, authorization("reservations.update"), async (req, res) => {
        try {
            
            const reservationId = parseInt(req.params.reservationId);

            if (isNaN(reservationId)) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid reservation id",
                    data: null,
                })
            }

            // check if reservation exists
            const exists = await checkReservationExistsById(reservationId);

            if (!exists) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Reservation not found",
                    data: null,
                })
            }

            const schema = Joi.object({
                roomId: Joi.number().required(),
                guestId: Joi.number().required(),
                startDate: Joi.date().required(),
                endDate: Joi.date().required(),
                checkInDate: Joi.date().optional().allow(null),
                checkOutDate: Joi.date().optional().allow(null),
                reservationStatus: Joi.string().optional().valid(...Object.values(ReservationStatuses))
            })

            const { error } = schema.validate(req.body);

            if (error) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: error.message,
                    data: null,
                })
            }
            

            // check if the guest exists
            const guestExists = await checkGuestExistsById(req.body.guestId);

            if (!guestExists) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Guest not found",
                    data: null,
                })
            }

            // TODO: check if the room exists

            //parse the dates
            if (req.body.startDate) {
                req.body.startDate = new Date(req.body.startDate);
            }

            if (req.body.endDate) {
                req.body.endDate = new Date(req.body.endDate);
            }
            

            const reservation:Reservation = {
                reservationId: reservationId,
                roomId: req.body.roomId,
                guestId: req.body.guestId,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                checkInDate: req.body.checkInDate,
                checkOutDate: req.body.checkOutDate,
                reservationStatus: req.body.reservationStatus
            }

            const updatedReservation = await updateReservation(reservation);

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Reservation updated successfully",
                data: updatedReservation,
            })

        } catch (err) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to update reservation",
                data: err.message,
            })
        }
    })

    /**
     * Delete reservation
     */
    router.delete("/:reservationId", authentication, authorization("reservations.delete"), async (req, res) => {
        try {
            const reservationId = parseInt(req.params.reservationId);

            if (isNaN(reservationId)) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.BAD_REQUEST,
                    message: "Invalid reservation id",
                    data: null,
                })
            }

            // check if reservation exists
            const exists = await checkReservationExistsById(reservationId);

            if (!exists) {
                return sendResponse(res, {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: "Reservation not found",
                    data: null,
                })
            }

            await deleteReservation(reservationId);

            return sendResponse(res, {
                success: true,
                statusCode: StatusCodes.OK,
                message: "Reservation deleted successfully",
                data: null,
            })

        } catch (err) {
            return sendResponse(res, {
                success: false,
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to delete reservation",
                data: err.message,
            })
        }
    })

    return {
        router
    }
}