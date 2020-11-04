require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token;
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    test('returns theorems', async() => {

      const expectation = [
        {
          id: 1,
          name: 'Pythagorean Theorem',
          difficulty: 1,
          veracity: true,
          field: 'geometry',
          owner_id: 1,
        },
        {
          id: 2,
          name: 'Prime Number Theorem',
          difficulty: 5,
          veracity: true,
          field: 'number theory',
          owner_id: 1,
        },
        {
          id: 3,
          name: 'Mertenz Conjecture',
          difficulty: 7,
          veracity: false,
          field: 'number theory',
          owner_id: 1,
        },
        {
          id: 4,
          name: 'Dirichlet\'s Theorem',
          difficulty: 6,
          veracity: true,
          field: 'number theory',
          owner_id: 1,
        }
      ];

      const data = await fakeRequest(app)
        .get('/theorems')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    test('returns a theorem', async() => {
      const expectation = {
        id: 1,
        name: 'Pythagorean Theorem',
        difficulty: 1,
        veracity: true,
        field: 'geometry',
        owner_id: 1,
      };

      const data = await fakeRequest(app)
        .get('/theorems/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

  });
});
