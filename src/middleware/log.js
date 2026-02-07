export function log(req, res, next) {
    const start = Date.now();

    console.log("\n==================== REQUEST ====================");
    console.log(`${req.method} ${req.originalUrl}`);

    if (Object.keys(req.params).length) {
        console.log("Params :", req.params);
    }

    if (Object.keys(req.query).length) {
        console.log("Query  :", req.query);
    }

    if (req.body && Object.keys(req.body).length) {
        console.log("Body   :", req.body);
    }

    // const originalSend = res.send;

    // res.send = function (body) {
    //     const duration = Date.now() - start;

    //     console.log("==================== RESPONSE ====================");
    //     console.log("Status :", res.statusCode);
    //     console.log("Time   :", `${duration} ms`);
    //     console.log("Body   :", body);
    //     console.log("=================================================\n");

    //     return originalSend.call(this, body);
    // };

    next();
}
