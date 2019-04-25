# google address to gps

free google address to gps api 

# usage

```
git clone https://github.com/postor/google-address2gps.git
cd google-address2gps
yarn
yarn start
```

open http://localhost:3000/?address=your_location

example result for http://localhost:3000/?address=central%20park
```
{  
   "address":"central park",
   "data":{  
      "OK":true,
      "list":[  
         {  
            "address":"Central Park, New York, NY, USA",
            "location":"40.782865,-73.965355",
            "types":"establishment, park, point_of_interest"
         }
      ]
   }
}
```

# docker usage

```
docker run -p 3000:3000 --rm postor/google-address2gps
```
