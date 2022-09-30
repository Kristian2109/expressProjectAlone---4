const request = require("supertest");
const app = require("../../app");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    })

    describe("Test GET /launches", () => {
        test("It should respond with 200 success", async () => {
            const response = await request(app)
                .get("/v1/launches")
                .expect(200)
                .expect('Content-Type', /json/)
        });
    });
    
    
    describe("Test POST /launch", () => {
        const completeLaunchData = {
            mission: "Bulgaria 1",
            rocket: "Ferrari",
            target: "Kepler-62 f",
            launchDate: "January 4, 2028"
        };
    
        const launcDataNoDate = {
            mission: "Bulgaria 1",
            rocket: "Ferrari",
            target: "Kepler-62 f"
        };
    
        const launchDateInvalidDate = {
            mission: "Bulgaria 1",
            rocket: "Ferrari",
            target: "Kepler-62 f",
            launchDate: "zooz"
        };
    
        test("It should respond with 201 success", async () => {
            const response = await request(app)
                .post("/v1/launches")
                .send(completeLaunchData)
                .expect("Content-Type", /json/)
                .expect(201);
            
            const requestDate = new Date(completeLaunchData.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toBe(requestDate);
    
            expect(response.body).toMatchObject(launcDataNoDate)
        });
    
        test("It should catch missing required properties", async () => {
            const response = await request(app)
                .post("/v1/launches")
                .send(launcDataNoDate)
                .expect("Content-Type", /json/)
                .expect(400);
            
            expect(response.body).toStrictEqual({
                error: "Not enough information"
            });
    
        });
        test("It should catch invalid dates", async () => {
            const response = await request(app)
                .post("/v1/launches")
                .send(launchDateInvalidDate)
                .expect("Content-Type", /json/)
                .expect(400);
    
            expect(response.body).toStrictEqual({
                error: "Invalid date"
            });
        });
    });
});
