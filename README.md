# Softruck Vehicle Tracking System

The Softruck vehicle tracking system receives millions of GPS points daily, sent by SFT9001 trackers installed in vehicles. These devices communicate via hexadecimal messages over a TCP connection. Each message contains either location data or a heartbeat (connection check), and the server is responsible for responding with an ACK to ensure the continuity of transmissions.

Trackers follow a well-defined packet structure, including a header, device identifier, message type, and variable data depending on the message type. The system follows the FIFO protocol, meaning the last received point represents the vehicle's latest known location.

The `TcpService` receives, validates, and interprets incoming packets, passing them to the `Sft9001Service` for storage. The `Sft9001Service` also performs consistency checks on data like latitude, longitude, direction, and distance traveled before storing.

The endpoint `/api/v1/location/:device_id` allows the frontend to query the latest known location of a specific vehicle, returning all relevant information (latitude, longitude, speed, among others). For security, an access control is used to restrict location visibility to authorized users only.

If the `TCP_PORT` and `PORT` are not defined in the `.env` file, default values will be used:
- `TCP_PORT`: 8080
- `PORT`: 3000

## Project setup

1. Clone the repository:

    ```bash
    $ git clone https://github.com/b3ernardo/vehicle-tracking.git
    ```

2. Navigate to the project directory and install dependencies:

    ```bash
    $ npm install
    ```

3. Install [Postman](https://www.postman.com/downloads/) to test the authentication and access control for the `/api/v1/location/:device_id` API route. Postman will be essential for sending and verifying authenticated requests to this endpoint.


## Compile and run the project

```bash
$ npm run start
````

## Run tests

```bash
$ npm run test:e2e
```

## Manual testing

The following manual testing instructions are for Linux environments. For best results, it's recommended to use a Linux system.

The `HeartbeatService` automatically sends a heartbeat every 2 minutes with a standard message of `50F70A3F730150494E4773C4`. You can change this message directly in the code if needed, as long as it adheres to the required format. Additionally, a heartbeat (ping) can be manually sent using the command in Step 1 below. To send a new location message, use only the terminal as shown in Step 3.

When the server responds with `Location received`, it means the location has been successfully saved in the database for the specified `device_id`. However, if the `device_id` has not successfully pinged in the last 2 minutes, a warning message will appear in the terminal: `Location data rejected for deviceId <device_id>; Ping required`. Additionally, warnings will be generated if the distance, latitude, longitude, or direction values fall outside their expected ranges. These warnings will also be displayed in the terminal to notify the user.

### Steps to manually test the application:

1. Send a Heartbeat (Ping) Request to the Server using netcat

   You can manually send a heartbeat message to the server as follows:
   
   ```bash
   $ echo -n 50F70A3F730150494E4773C4 | xxd -r -p | nc -v localhost 8080
   ````
   
2. Receive the Server's Ping ACK Response

   After sending the heartbeat message, the server should respond with a Ping ACK message:
   
   ```bash
   $ 50F70150494E4773C4
   ````

3. Send a Location Request to the Server using netcat

   To manually send a location update:
   
   ```bash
   $ echo -n 50F70A3F73025EFCF950156F017D784000008CA0F80084003C013026A1029E72BD73C4 | xxd -r -p | nc -v localhost 8080
   ````

4. Receive Confirmation of Location Saved
   
   When the server responds with `Location received`, it confirms that the location data has been saved in the database for the given `device_id`.

5. User Authentication with JWT

   The application uses a fake database that registers two users:
   
   ```json
    {
      userId: 1,
      username: '671603',
      password: 'password',
    },
    {
      userId: 2,
      username: '273445',
      password: 'password',
    }
   ````
   Where the `username` is equal to the `device_id`. To authenticate, follow these steps:

   5.1. Send a POST request to `http://localhost:3000/auth/login`, passing the following JSON in the Body, for example
   
      ```json
      {
        username: '671603',
        password: 'password',
      }
     ````

   5.2. Use the token to access the location route
   
   With the accessToken generated, send a GET request to the route `http://localhost:3000/api/v1/location/671603`, passing the token in the `Authorization` tab of Postman:
   - Select the `Bearer Token` option.
   - Paste the accessToken in the `token` field.
   This will authorize access to your device’s location route, and you will receive the corresponding location data.
   Otherwise, if the token is invalid or does not match the `device_id`, you will receive an Unauthorized status.

6. Expected Response Object

   If authorized, the retrieved object should resemble the following structure:

   ```json
    {
        "deviceId": 671603,
        "epochData": "2020-07-01T21:00:00.000Z",
        "direction": 54.87,
        "distance": 25000000,
        "operatingTime": 36000,
        "composition": {
            "gpsFixed": 1,
            "gpsLive": 1,
            "ignition": 1,
            "latitudeNegative": 1,
            "longitudeNegative": 1,
            "reserved": [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
        },
        "speed": 60,
        "latitude": 19.932833,
        "longitude": 43.938493
    }
   ````
   
## Project structure

The project is organized primarily under the `src` folder. The key services in the project include:

- Users Service: Stores a fake dataset of users.
- Auth Service: Handles authorization for accessing the endpoint that retrieves the latest location of a device.
- Heartbeat Service: A testing service that sends a heartbeat every 2 minutes.
- TCP Service: Initiates the TCP connection and processes the received data in hexadecimal format.
- SFT9001 Service: Implements the device logic. It contains a fake database (using a Map structure) that stores the latest location for each `device_id`. This service also includes validations for the range of distance, latitude, longitude, and direction.
  
This structure allows the project to be modular and organized, with each service handling a specific aspect of the application.

## Possible improvements to be implemented

- Improving authentication and authorization: Making the process more secure by avoiding key exposure and encrypting data.
- User registration with a database: Replacing the fake database with a real one to store users, ensuring data persistence and scalability.
- Using QuestDB for location data: Storing temporal location data efficiently with QuestDB.
- Storing historical location data: Implementing a way to store the historical location of the device in memory, enabling tracking and retrieval of past locations.
- Frontend: Creating a web interface to simplify testing and interacting with the application.
- Improving tests: Expanding test coverage to include more edge cases
