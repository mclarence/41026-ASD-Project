const strings = {
    // API Response Messages
    api: {
        success: "Success",
        serverError: "The server encountered an internal error. Please try again later.",
        unauthorized: "You are not authorized to perform this action.",
        unauthenticated: "This action requires authentication.",
        cannotDeleteSelf: "You cannot delete yourself.",
        missingField: (fieldName: string) => `The request body is missing the required field: ${fieldName}`,
        tokenInvalid: "The provided token is invalid.",
        invalidUserId: "The provided userId is invalid.",
        userIdNotFound: (userId: number) => `User with userId ${userId} not found.`,
        usernameNotFound: (username: string) => `User with username ${username} not found.`,
        userConflict: (username: string) => `User with username ${username} already exists.`,
        userConflictId: (userId: number) => `User with userId ${userId} already exists.`,
        roleIdNotFound: (roleId: number) => `Role with roleId ${roleId} not found.`,
        loggedOut: "You have been logged out.",
        invalidField: (fieldName: string) => `The request body contains an invalid field: ${fieldName}`,
        incorrectPassword: "Incorrect password.",
        loginSuccessful: "Login successful.",
        queryNotProvided: "A query was not provided.",
        invalidRoomId: "The provided roomId is invalid.",
        roomIdNotFound: (roomId: number) => `Room with roomId ${roomId} not found.`,
        roomConflict: (roomCode: string) => `Room with room code ${roomCode} already exists.`,
        invalidRoomCode: "The provided roomCode is invalid.",
    }
}

export default strings;