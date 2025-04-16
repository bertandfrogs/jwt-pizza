host=https://pizza-service.smalley329.com

response=$(curl -s -X PUT $host/api/auth -d '{"email":"", "password":""}' -H 'Content-Type: application/json')
token=$(echo $response | jq -r '.token')

curl -s -X PUT $host/api/auth/1 -d '{"email":"", "password":""}' -H 'Content-Type: application/json' -H "Authorization: Bearer $token"