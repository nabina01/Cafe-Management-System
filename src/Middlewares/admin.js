const isAdmin = (req, res, next) => {

    const userRole = req.user.role; 
    if (userRole !== 'admin') {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
    
}

// const checkpermission = (permission)=>{
//     (req, res, next) => {
//         const userPermissions = req.user.permissions;
//         const hasPermission = userPermissions.includes(permission);
//         if (!hasPermission) {
//             return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
//         }
//         next();
//     }
// }

export { isAdmin };