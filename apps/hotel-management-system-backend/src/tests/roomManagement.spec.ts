import {Room, RoomStatuses} from "@hotel-management-system/models";
import {faker} from "@faker-js/faker";
import request from "supertest";
import {login} from "./authentication.spec";
import {Express} from "express";
import startServer from "../startServer";
import {serverConfig} from "./serverConfig";

let app: Express;
beforeAll(async () => {
    return await startServer(serverConfig).then(
        (server) => {
            app = server.app;
        }
    )
})
export const makeNewRoom = (): Room => {
    return {
        roomCode: faker.string.alphanumeric(5),
        status: RoomStatuses.AVAILABLE,
        pricePerNight: 100,
        description: "room description",
    }
}

export const addRoom = async (token: string, room: Room): Promise<Room> => {
    const response = await request(app)
        .post('/api/rooms/add')
        .set('Authorization', `Bearer ${token}`)
        .send(room)
        .expect((res) => (res.status != 201 ? console.log(res.body) : 0))
        .expect(201)

    return response.body.data;
}

describe("room management", () => {
    it("should add a room", async () => {
        const token = await login();
        const newRoom = makeNewRoom()
        const room = await addRoom(token, newRoom)

        expect(room.roomCode).toEqual(newRoom.roomCode)
        expect(room.status).toEqual(newRoom.status)
        expect(room.pricePerNight).toEqual(newRoom.pricePerNight)
        expect(room.description).toEqual(newRoom.description)
    })

    it("should update a room", async () => {
        const token = await login();
        const newRoom = makeNewRoom()
        const room = await addRoom(token, newRoom)

        const updatedRoom = {
            ...room,
            status: RoomStatuses.UNAVAILABLE
        }

        delete updatedRoom.roomId

        const response = await request(app)
            .patch(`/api/rooms/${room.roomId}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updatedRoom)
            .expect(200)

        expect(response.body.data.status).toEqual(updatedRoom.status)
    })

    it("should get a room by id", async () => {
        const token = await login();
        const newRoom = makeNewRoom()
        const room = await addRoom(token, newRoom)

        const response = await request(app)
            .get(`/api/rooms/${room.roomId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(response.body.data).toEqual(room)
    })

    it("should get all rooms", async () => {
        const token = await login();
        const newRoom = makeNewRoom()
        const room = await addRoom(token, newRoom)

        const response = await request(app)
            .get(`/api/rooms`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        expect(response.body.data.length).toBeGreaterThan(0)
    })

    it("should delete a room", async () => {
        const token = await login();
        const newRoom = makeNewRoom()
        const room = await addRoom(token, newRoom)

        await request(app)
            .delete(`/api/rooms/${room.roomId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)

        await request(app)
            .get(`/api/rooms/${room.roomId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(404)
    })
})