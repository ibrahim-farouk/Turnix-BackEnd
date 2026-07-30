import * as authService from "./auth.service.js"; 

export const login = async (req, res, next) => {
    try {
        const { email, password, rememberMe } = req.body;
        const user = await authService.login({ email, password, rememberMe }); 
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: user
        });
    }
    catch (error) {
        next(error);
    }
};