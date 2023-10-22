#!/usr/bin/env python
# (c) 2013 E.Bertin <bertin@iap.fr>
import sys
import numpy as np
from matplotlib import pyplot as plt
narg = len(sys.argv)
if narg < 2:
	print("syntax: " + sys.argv[0] + "<file1> [<file2> ...]")
	sys.exit(0)
ncat = narg - 1
concur = []
rate = []
laten = []
through = []
complete = []
failed = []
for cat in sys.argv[1:]:
	fcat = open(cat, 'r')
	for line in fcat:
		line = line.strip()
		col = line.split()
		concur.append(float(col[0]))
		rate.append(float(col[1]))
		laten.append(float(col[2]))
		through.append(float(col[3]))
		complete.append(float(col[4]))
		failed.append(float(col[3]))
	fcat.close()
fig, ax1 = plt.subplots()
#plt.title("With I/O cache", fontsize=7)
ax1.plot(concur,rate,'o',color=(0.5,0.5,1.0))
ax1.set_xlabel('Number of concurrent requests')
ax1.set_xlim(0.5,20000.0)
ax1.set_xscale('log')
ax1.set_xticks((1,10,100,1000,10000),('1','10','100','1000','10000'))
ax1.set_ylabel('Tiles served per second',color=(0.5,0.5,1.0))
ax1.set_ylim(-10, 8500.0)
ax1.tick_params(axis='y',labelcolor=(0.5,0.5,1.0))
ax1.grid(axis='x')
ax2 = ax1.twinx()

ax2.plot(concur,laten,'o',color=(1.0,0.5,0.0))
ax2.set_ylabel('Latency',color=(1.0,0.5,0.0))
ax2.set_yscale('log')
ax2.set_ylim(0.05,20000.0)
ax2.set_yticks([0.1, 1.0, 10.0,100.0,1000.0,10000.0])
ax2.set_yticklabels(('100μs', '1ms', '10ms','100ms','1s', '10s'),color=(1.0,0.5,0.0))
plt.show()

