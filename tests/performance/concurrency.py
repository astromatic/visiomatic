#!/usr/bin/env python3
# (c) 2013-2023
# E.Bertin <emmanuel.bertin@universite-paris-saclay.fr>
import argparse

version = "2.0"

parser = argparse.ArgumentParser(description="Measure Visiomatic server performance using Apache Bench")

parser.add_argument('url', help="API URL")
parser.add_argument('-b', '--batches', type=int, default=10, help="number of concurrency batches (default: 10)")
parser.add_argument('-c', '--concurrency', type=int, default=20000, help="maximum concurrency (default: 20000)")
parser.add_argument('-i', '--indices', type=int, default=6000, help="tile index range (default: 6000)")
parser.add_argument('-o', '--output', default='visiomatic.log', help="Output file name (default: visiomatic.log)")
parser.add_argument('-r', '--reset', action='store_true', help="send server reset before each request")
parser.add_argument('-z', '--zoom', type=int, default=8, help="tile zoom level (default: 8)")
parser.add_argument('-v', '--version', action='version', version=version)

args = vars(parser.parse_args())

import random,re,subprocess,sys,time
import numpy as np
from math import log10, pow
from matplotlib import pyplot as plt

regroup = re.compile(r'^http://([^/]*)($|/.*)').search(args['url'])
url = regroup.group(1)
uri = regroup.group(2)
if uri=="":
	uri = "/"
print("URL: " + url, file=sys.stderr)
print("URI: " + uri, file=sys.stderr)
zoom = args['zoom']
tilerange = args['indices']
nconcur = args['batches']
resetflag = args['reset']
ofile = args['output']
maxconcur = args['concurrency']
if resetflag == 0:
		print("Generating random batch...", file=sys.stderr)
		log = open("req.log",'w')
		for i in range(tilerange):
			log.write(f"http://{url}{uri}&CNT={10.*random.random():.3f}&JTL={zoom},{random.randint(1,tilerange)}\n")
		log.close()
		print("Sending warm-up requests...", file=sys.stderr)
		output = subprocess.check_output(["./ab","-r","-c", "200","-n", "%d" %tilerange,"-L","req.log"]) 

print("Starting %d batch requests..." %nconcur, file=sys.stderr)
timereg = re.compile(r'\D*([0-9]+([.][0-9]*)?|[.][0-9]+)\D*')
ffile = open(ofile, 'w')
for c in range(0,nconcur):
	iconcur = int(pow(10.0,random.uniform(0.0,log10(maxconcur))))
	print("########### %d concurrent requests ###########" %iconcur, file=sys.stderr)
	nreq = 10*iconcur
	if nreq < 2000:
		nreq = 2000
	if resetflag != 0:
		#print("Sending server reset...", file=sys.stderr)
		#reset = subprocess.check_output(["/usr/bin/ssh","image","/resetls"])
		print("Generating new random batch...", file=sys.stderr)
		log = open("req.log",'w')
		for i in range(nreq):
			log.write(f"http://{url}{uri}&CNT={10.*random.random():.3f}&JTL={zoom},{random.randint(1,tilerange)}\n")
		log.close()
	time.sleep(5.0)
	print("Sending requests...", file=sys.stderr)
	output = subprocess.check_output(["./ab","-r","-c", "%d" %iconcur,"-n", "%d" %nreq,"-L","req.log"]).decode("utf-8")
	firstflag = 1
	for line in output.split("\n"):
		if 'Requests per second:' in line:
			reqpersec = float(timereg.search(line).group(1))
		if 'Time per request:' in line and firstflag:
			timeperrec = float(timereg.search(line).group(1))
			firstflag = 0
		if 'Transfer rate:' in line:
			transrate = float(timereg.search(line).group(1))
		if 'Complete requests:' in line:
			complete = float(timereg.search(line).group(1))
		if 'Failed requests:' in line:
			failed = float(timereg.search(line).group(1))
	print("%g " %iconcur + "\t%g" %reqpersec + "\t%g" %timeperrec + "\t%g" %transrate + "\t%g" %complete + "\t%g" %failed, file=ffile, flush=True)
ffile.close()

