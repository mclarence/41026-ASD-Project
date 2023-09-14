import { Room } from '@hotel-management-system/models'

const rooms: Room[] = [
    {
        roomId: 1,
        status: 'Available',
        price: 100,
        priceUnit: 'Night',
        metadata: 'Room 1',
    },
    {
        roomId: 2,
        status: 'Available',
        price: 100,
        priceUnit: 'Night',
        metadata: 'Room 2',
    }
]

export const getRooms = new Promise<Room[]>((resolve, reject) => {
    resolve(rooms);
});

export const getRoomById = (roomId: number): Promise<Room | undefined> => {
    return new Promise<Room>((resolve, reject) => {
        const room = rooms.find(u => u.roomId === roomId);
        if (room === undefined) {
            reject(`Room with id ${roomId} not found`);
        } else {
            resolve(room);
        }
    })
}

export const createRoom = (room: Room): Promise<Room> => {
    return new Promise<Room>((resolve, reject) => {
        const newRoom = {
            ...room,
            roomId: rooms.length + 1,
        }

        rooms.push(newRoom);

        resolve(newRoom);
    })
}

export const deleteRoom = (roomId: number): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
        const index = rooms.findIndex(u => u.roomId === roomId);

        if (index === -1) {
            reject(`Room with id ${roomId} not found`);
        } else {
            rooms.splice(index, 1);
            resolve();
        }
    })
}