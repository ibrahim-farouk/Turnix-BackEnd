import * as employeeService from "./employee.service.js";

export const getEmployees = async (req, res, next) => {
    try {
        const employees = await employeeService.getEmployees(req.query);
        res.status(200).json({
            success: true,
            message: "Employees fetched successfully",
            data: employees
        });
    } catch (error) {
        next(error);
    }
};

export const getEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.getEmployee(req.params.id);
        res.status(200).json({
            success: true,
            message: "Employee fetched successfully",
            data: employee
        });
    } catch (error) {
        next(error);
    }
};

export const createEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.createEmployee(req.body);
        res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee
        });
    } catch (error) {
        next(error);
    }
};

export const updateEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.updateEmployee(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: employee
        });
    } catch (error) {
        next(error);
    }
};

export const deleteEmployee = async (req, res, next) => {
    try {
        const employee = await employeeService.deleteEmployee(req.params.id);
        res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
            data: employee
        });
    } catch (error) {
        next(error);
    }
};

export const resetEmployeePassword = async (req, res, next) => {
    try {
        const employee = await employeeService.resetEmployeePassword(req.params.id, req.body.newPassword);
        res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        next(error);
    }
}