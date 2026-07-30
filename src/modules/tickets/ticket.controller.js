import * as ticketService from "./ticket.service.js";

export const joinQueue = async (req, res, next) => {
    try {
        const result = await ticketService.joinQueue(req.body);
        return res.status(201).json({
            success: true,
            message: "Ticket created successfully",
            data: result
        })
    } catch (err) {
        next(err);
    }
};

export const trackTicket = async (req, res, next) => {
    try {
        const guestToken = req.headers["x-guest-token"];
        const result = await ticketService.trackTicket(req.params.ticketId, guestToken);
        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        next(err);
    }
};