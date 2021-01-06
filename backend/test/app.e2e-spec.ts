import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Socket } from 'socket.io';
import * as io from 'socket.io-client';
import { Connection, createConnection } from 'typeorm';
import any = jasmine.any;
import { MeditationGroup } from '../src/entities/meditation-group.entity';
import { Participant } from '../src/entities/participant.entity';
import { MentalState } from '../src/entities/mentalState.entity';
import axios from 'axios';
import objectContaining = jasmine.objectContaining;


describe('Mindmeld Backend (e2e)', () => {
  let socket1: Socket, socket2: Socket, socket3: Socket;
  let envConfig: { [key: string]: string };
  let dbConnection: Connection;
  const newGroupRequest = {
    groupName: 'Test Group',
    duration: 10 // 10 minutes
  };
  const newGroupRequest2 = {
    groupName: 'Test Group 2',
    duration: 0.05 // 3 seconds
  };

  const joinGroupRequest = {
    groupName: newGroupRequest.groupName,
    participant: {
      posture: 'SEIZA',
      nickname: 'Test Participant'
    }
  }
  const joinGroupRequest2 = {
    groupName: newGroupRequest.groupName,
    participant: {
      posture: 'QUARTERLOTUS',
      nickname: 'Test Participant 2'
    }
  }
  const joinGroupRequest3 = {
    groupName: newGroupRequest.groupName,
    participant: {
      posture: 'CHAIR',
      nickname: 'Test Participant 3'
    }
  }
  const joinGroupRequest4 = {
    groupName: newGroupRequest2.groupName,
    participant: {
      posture: 'CHAIR',
      nickname: 'Test Participant 3'
    }
  }
  const mentalState1 = {
    relaxation: 0.8,
    active: true
  }
  const mentalState2 = {
    relaxation: 1,
    active: true
  }
  let token;


  beforeAll( async done => {
    // load environment
    envConfig = dotenv.parse(fs.readFileSync('.env'));

    // Setup database connection
    dbConnection = await createConnection({
      name: 'test-connection',
      type: 'mysql',
      host: envConfig['DATABASE_HOST'],
      port: Number(envConfig['DATABASE_PORT']),
      username: envConfig['DATABASE_USERNAME'],
      password: envConfig['DATABASE_PASSWORD'],
      database: envConfig['DATABASE_NAME'],
      entities: [MeditationGroup, Participant, MentalState]
    });

    // Truncate db
    await dbConnection.getRepository(MentalState).delete({});
    await dbConnection.getRepository(Participant).delete({});
    await dbConnection.getRepository(MeditationGroup).delete({});

    // Init two sockets
    socket1 = io(`http://localhost:${envConfig.PORT}`);
    socket2 = io(`http://localhost:${envConfig.PORT}`);
    socket3 = io(`http://localhost:${envConfig.PORT}`);

    let connectionCount = 0;
    const connected = () => {
      connectionCount++;
      if (connectionCount == 3) {
        done();
      }
    };

    socket1.on('connect', () => connected());
    socket2.on('connect', () => connected());
    socket3.on('connect', () => connected());
  });


  afterAll( async done => {
    // Disconnect sockets
    if (socket1.connected) {
      socket1.disconnect();
    }

    if (socket2.connected)
    {
      socket2.disconnect();
    }

    if (socket3.connected)
    {
      socket3.disconnect();
    }

    setTimeout(async () => {
      // Truncate db
      await dbConnection.getRepository(MentalState).delete({});
      await dbConnection.getRepository(Participant).delete({});
      await dbConnection.getRepository(MeditationGroup).delete({});
      await dbConnection.close();

      done();

    }, 1000);
  });


  it('creates a new meditation group', done => {

    socket1.once('group-created', async (payload) => {
      // Check response
      expect(payload.group).toEqual({
        name: newGroupRequest.groupName,
        participants: [],
        started: expect.any(Boolean),
        duration: newGroupRequest.duration
      });

      // Check db entry
      const meditationGroupEntity = await dbConnection.getRepository(MeditationGroup)
        .findOne({ where: { name: newGroupRequest.groupName }} );

      expect(meditationGroupEntity).toEqual({
        id: any(Number),
        name: newGroupRequest.groupName,
        created: expect.anything(),
        started: null,
        ended: null,
        duration: newGroupRequest.duration
      });

      done();
    });

    socket1.emit('create-group', newGroupRequest);
  });


  it('does not allow to create a group with the same name as another active group', done => {

    socket1.once('group-already-exists', async (payload) => {
      // Check response
      expect(payload).toEqual({
        groupName: newGroupRequest.groupName,
      });

      done();
    });

    socket1.emit('create-group', newGroupRequest);
  });


  it('tells participants if a meditation group exits', done => {

    socket1.once('group-found', async (payload) => {
      // Check response
      expect(payload.group).toEqual({
        name: newGroupRequest.groupName,
        participants: [],
        started: expect.any(Boolean),
        duration: newGroupRequest.duration
      });

      done();
    });

    socket1.emit('find-group', { groupName: newGroupRequest.groupName });
  });


  it('tells participants if a meditation group does not exists', done => {

    socket1.once('group-not-found', async (payload) => {
      // Check response
      expect(payload).toEqual({
        groupName: newGroupRequest.groupName + 'x',
      });

      done();
    });

    socket1.emit('find-group', { groupName: newGroupRequest.groupName + 'x' });
  });


  it('lets participants join a meditation group', done => {

    // When group joined
    socket1.once('joined-group', async (payload) => {
      // Check response
      expect(payload.group).toEqual({
        name: newGroupRequest.groupName,
        participants: expect.any(Array),
        started: expect.any(Boolean),
        duration: newGroupRequest.duration
      });

      expect(payload.group.participants.length).toBe(1);
      expect(payload.group.participants[0]).toEqual({
        nickname: joinGroupRequest.participant.nickname,
        posture: joinGroupRequest.participant.posture,
        placeId: 0,
      });

      // Check db entry
      const participantEntity = await dbConnection.getRepository(Participant)
        .findOne({ where: { nickname: joinGroupRequest.participant.nickname }} );
      expect(participantEntity.id).toBeDefined();
      expect(participantEntity.created).not.toBeNull();
      expect(participantEntity.nickname).toBe(joinGroupRequest.participant.nickname);
      expect(participantEntity.placeId).toBe(0);
      expect(participantEntity.posture).toBe(joinGroupRequest.participant.posture);
      expect(participantEntity.leftGroup).toBeNull();

      done();
    });

    socket1.emit('join-group', joinGroupRequest);
  });


  it('does not let participants join a meditation group twice', done => {

    // When group joined
    socket1.once('already-joined-group', async (payload) => {
      // Check response
      expect(payload).toEqual({
        groupName: newGroupRequest.groupName,
      });

      done();
    });

    socket1.emit('join-group', joinGroupRequest);
  });


  it('does not let participants join if nickname is already used in this group', done => {

    // When group joined
    socket2.once('nickname-already-exists', async (payload) => {
      // Check response
      expect(payload).toEqual({
        nickname: joinGroupRequest.participant.nickname,
      });

      done();
    });

    socket2.emit('join-group', joinGroupRequest);
  });


  it('notifies participants if another participant joins the group', done => {

    // When socket participant joined the group check notification
    socket1.once('participant-joined', async (payload) => {
      expect(payload.participant).toEqual({
        nickname: joinGroupRequest2.participant.nickname,
        posture: joinGroupRequest2.participant.posture,
        placeId: 3,
      });

      done();
    });

    // let participant join group
    socket2.emit('join-group', joinGroupRequest2);
  });


  it('lets group leader start the group', done => {

    // When socket participant joined the group check notification
    socket1.once('group-started', async (payload) => {

      // Check response
      expect(payload.placeId).toBeDefined();
      expect(payload.group).toBeDefined();
      expect(payload.group.started).toEqual(true);

      // Check db entry
      const meditationGroupEntity = await dbConnection.getRepository(MeditationGroup)
        .findOne({ where: { name: newGroupRequest.groupName }} );
      expect(meditationGroupEntity.started).not.toBeNull();

      done();
    });

    // let participant join group
    socket1.emit('start-group');
  });


  it('does not let participants join a meditation group if it has been started', done => {

    // When socket participant joined the group check notification
    socket3.once('group-already-started', async () => {
      done();
    });

    // let participant join group
    socket3.emit('join-group', joinGroupRequest3);
  });


  it('lets participants update their mental state', done => {

    // Update mental states
    socket1.emit('update-mental-state', mentalState1);
    socket2.emit('update-mental-state', mentalState2);

    setTimeout(async () => {
      // Check db entries
      const mentalStates = await dbConnection.getRepository(MentalState).find();
      expect(mentalStates.length).toBe(3);
      expect(mentalStates).toEqual(expect.arrayContaining([
        expect.objectContaining(mentalState1),
        expect.objectContaining(mentalState2)
      ]));

      done();
    }, 1000);
  });


  it('notifies participants about the calculated mental state of their group', done => {

    socket1.once('mental-states', payload => {
      expect(payload.group.relaxation).toBeCloseTo(0.9);
      expect(payload.participants).toEqual(
        expect.arrayContaining([
          {
            placeId: 0,
            mentalState: expect.objectContaining(mentalState1)
          },
          {
            placeId: 3,
            mentalState: expect.objectContaining(mentalState2)
          },
        ])
      );

      done();
    });
  });


  it('notifies other participants if another participant leaves their group', done => {

    // When socket participant leaves the group check notification
    socket1.once('participant-left', async (payload) => {
      expect(payload.placeId).toBe(3);

      done();
    });

    // Let participant leave group
    socket2.emit('leave-group');
  });


  it('lets participants leave their group', done => {

    socket1.once('left-group', async () => {
      // Check db entry
      const participantEntity = await dbConnection.getRepository(Participant)
        .findOne({ where: { nickname: joinGroupRequest.participant.nickname }} );
      expect(participantEntity.leftGroup).not.toBeNull();

      done();
    });

    socket1.emit('leave-group');
  });


  it('ends group if all participants have left the group', done => {
    socket1.once('group-not-found', async (payload) => {
      // Check response
      expect(payload).toEqual({
        groupName: newGroupRequest.groupName
      });

      // Check db entry
      const meditationGroupEntity = await dbConnection.getRepository(MeditationGroup)
        .findOne({ where: { name: newGroupRequest.groupName }} );
      expect(meditationGroupEntity.ended).not.toBeNull();

      done();
    });

    socket1.emit('find-group', { groupName: newGroupRequest.groupName });
  });

  it('returns auth token', async done => {

    // Get token
    axios.post(`http://localhost:${envConfig.PORT}/api/auth/token`,
      {email: 'andre@raider.dev', password: 'test1234'}).then(response => {
      expect(response.data.user).toBeDefined();
      expect(response.data.expiresIn).toEqual(expect.any(Number));
      expect(response.data.token).toEqual(expect.any(String));
      token = response.data.token;
      done();
    });
  });

  it('returns all group statistics', async done => {
    const config = { headers: { Authorization: 'Bearer ' + token } }
    axios.get(`http://localhost:${envConfig.PORT}/api/statistics`, config).then(response => {
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            name: newGroupRequest.groupName,
            created: expect.anything(),
            started: expect.anything(),
            ended: expect.anything(),
            duration: newGroupRequest.duration
          })
        ]
      ));
      done();
    });
  });

  it('returns single group statistics', async done => {

    const meditationGroupEntity = await dbConnection.getRepository(MeditationGroup)
      .findOne({ where: { name: newGroupRequest.groupName }} );

    const config = { headers: { Authorization: 'Bearer ' + token } }
    axios.get(`http://localhost:${envConfig.PORT}/api/statistics/${meditationGroupEntity.id}`, config).then(response => {
      expect(response.data).toEqual({
        id: expect.any(Number),
        name: newGroupRequest.groupName,
        created: expect.anything(),
        started: expect.anything(),
        ended: expect.anything(),
        duration: newGroupRequest.duration,
        mentalStates: expect.arrayContaining([
          objectContaining({
            relaxation: expect.any(Number),
            created: expect.anything()
          })
        ]),
        participants: expect.arrayContaining([
          expect.objectContaining({
            id: expect.anything(),
            nickname: joinGroupRequest.participant.nickname,
            posture: joinGroupRequest.participant.posture,
            placeId: 0,
            created: expect.anything(),
            leftGroup: expect.anything(),
          }),
          expect.objectContaining({
            id: expect.anything(),
            nickname: joinGroupRequest2.participant.nickname,
            posture: joinGroupRequest2.participant.posture,
            placeId: 3,
            created: expect.anything(),
            leftGroup: expect.anything(),
          })
        ])
      });
      done();
    });
  });

  it('returns mental states data for participant in statistics', async done => {

    const meditationGroupEntity = await dbConnection.getRepository(MeditationGroup).findOne({
      where: {
        name: newGroupRequest.groupName
      },
      join: {
        alias: "group",
        leftJoinAndSelect: {
          participants: "group.participants"
        }
      }
    });

    const config = { headers: { Authorization: 'Bearer ' + token } }
    axios.get(`http://localhost:${envConfig.PORT}/api/statistics/${meditationGroupEntity.id}/participants/${meditationGroupEntity.participants[0].id}/mental-states`, config).then(response => {
      expect(response.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining(mentalState1),
        ])
      );
      done();
    });
  });



  it('removes groups.', async done => {
    // Truncate db
    await dbConnection.getRepository(MentalState).delete({});
    await dbConnection.getRepository(Participant).delete({});
    await dbConnection.getRepository(MeditationGroup).delete({});

    socket1.once('group-removed', async () => {
      // Check db entry
      const meditationGroupEntity = await dbConnection.getRepository(MeditationGroup)
        .findOne({ where: { name: newGroupRequest.groupName }} );
      expect(meditationGroupEntity).toBeUndefined();

      done();
    });

    // Remove group after it has been created
    socket1.once('group-created', async () => {
      socket1.emit('remove-empty-group', { groupName: newGroupRequest.groupName });
    });

    // create group first
    socket1.emit('create-group', newGroupRequest);
  });


  it('notifies participants if group is over', done => {
    socket1.once('time-over', () => done());

    // Join group after it has been created
    socket1.once('group-created', () => socket1.emit('join-group', joinGroupRequest4));

    // Start group after joining
    socket1.once('joined-group', () => socket1.emit('start-group'));

    // create group first
    socket1.emit('create-group', newGroupRequest2);
  });

});
