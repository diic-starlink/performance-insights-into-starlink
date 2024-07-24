# How to get Geolocation from IP Address

The traceroute measurements gave a path of IP addresses that reflect to a real-world path of routers.
Now it is in question where this path is located on the world as this is usually the most determining
factor in order to make conclusion about latency and packet loss.

The problem is that IP addresses are assigned dynamically. Therefore, it is hard to tell to which
geographical location an IP address belongs to. For smaller routers, especially in residential homes
we cannot conclude a geographical location. However, larger routers usually have statically
assigned IP addresses. Those can be related to the physical location of the router.

Among the available database, we chose to use the database provided by [MaxMind]. It offers a
comprehensible Python package that allows to quickly resolve IP addresses to their geographical 
location.

```python
# Construct a reader object to read from the DB.
reader = geoip2.database.Reader('./data/GeoLite2-City.mmdb')

# Construct the IP addresses to an object.
ip_routes = [
    [ hop.get('result')[0].get('from') for hop in route ]
    for route in routes
]

detailed_routes = []
for route in ip_routes:
	r = []
	for ip in route:
		# The reader will thrown an exception if it cannot find the IP.
		try:
			res = reader.city(ip)
			r.append((
				res.country.name,
				res.city.name,
				res.location.latitude,
				res.location.longitude
			))
		except:
			pass
	detailed_routes.append(r)
```

For reference how the response object of `reader.city(ip)` looks like, find reference on 
[maxmind/GeoIP2-python].

## Obtaining the Dataset

[MaxMind] does not give away the databases for free. However, you can obtain them from 
[P3TERX/GeoLite].

[MaxMind]: https://www.maxmind.com/en/home
[P3TERX/GeoLite]: https://github.com/P3TERX/GeoLite.mmdb
[maxmind/GeoIP2-python]: https://github.com/maxmind/GeoIP2-python
