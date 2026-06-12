import { z } from "zod";

const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const registerSchema = z.object({
    userName: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username cannot exceed 50 characters")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers and underscores"
        ),

    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(50, "Name cannot exceed 50 characters"),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email format"),

    password: z
        .string()
        .regex(
            passwordRegex,
            "Password must contain uppercase, lowercase, number and special character"
        )
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email()
        .optional(),

    userName: z
        .string()
        .trim()
        .min(3)
        .optional(),

    password: z
        .string()
        .min(1, "Password is required")
})
.refine(
    data => data.email || data.userName,
    {
        message: "Email or username is required",
        path: ["email"]
    }
);

export const createAdminSchema = registerSchema;
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email")
});
export const resetPasswordSchema = z.object({
    password: z
        .string()
        .regex(passwordRegex),

    confirmPassword: z
        .string()
})
.refine(
    data => data.password === data.confirmPassword,
    {
        message: "Passwords do not match",
        path: ["confirmPassword"]
    }
);

export const updateUserSchema = z.object({
    name: z
        .string()
        .trim()
        .max(50)
        .optional(),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email()
        .optional(),

    currentPassword: z
        .string()
        .optional(),

    newPassword: z
        .string()
        .regex(passwordRegex)
        .optional()
})
.refine(
    data =>
        !(data.newPassword && !data.currentPassword),
    {
        message:
            "Current password is required to change password",
        path: ["currentPassword"]
    }
).refine(
        data => Object.keys(data).length > 0,
    {
        message: "At least one field is required"
    }

)

export const objectIdSchema = z
    .string()
    .regex(
        /^[0-9a-fA-F]{24}$/,
        "Invalid MongoDB ObjectId"
    );

export const userIdParamSchema = z.object({
    id: objectIdSchema
});

export const verifyTokenSchema = z.object({
    verificationToken: z
        .string()
        .trim()
        .min(1)
});

export const resetTokenParamSchema = z.object({
    token: z
        .string()
        .trim()
        .min(1)
});

