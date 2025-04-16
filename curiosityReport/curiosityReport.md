# Curiosity Report: Amazon Route 53

### Introduction
I chose to dive a bit deeper into Amazon's Route 53. Registering a domain name and setting up hosted zones piqued my interest, so I thought I would do some reading of Amazon's docs to learn a bit more about what you're able to set up within the service.

### Health Checks
I decided to look into how Amazon's Route 53 health checks work. Essentially, Amazon sends requests to your specified endpoint at a certain interval, and if the endpoint fails a certain number of times (specified by the user), Route 53 notifies CloudWatch. This process seems to be very similar to Grafana's alert system, and I would have found it useful to have when I was setting up my website.

### CNAME Records
While setting up JWT pizza service, I wanted to learn a bit more about creating CNAME records that route internet traffic to different AWS resources. I was intrigued to learn that it's possible to set up Route 53 resources through CloudFormation.