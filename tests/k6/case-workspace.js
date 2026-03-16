import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
  },
  vus: 5,
  iterations: 25,
};

export default function () {
  const response = http.get('http://localhost:3000/health');

  check(response, {
    'health ok': (res) => res.status === 200,
  });

  sleep(1);
}