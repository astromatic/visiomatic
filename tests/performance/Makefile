# Minimalistic Makefile for building a custom version
# of the ApacheBench (ab) benchmarking tool.
# (C) Emmanuel Bertin 07/10/2023

EXEC = ab
SHELL = /bin/sh
LATEXFAST = pdflatex -draftmode -interaction=nonstopmode
LATEXSLOW = pdflatex -interaction=nonstopmode
FILTER = \grep -e "^\(\!\|l\.\)"
.SUFFIXES:
.SUFFIXES: .bib .pdf .tex
.PHONY: clean

all: $(EXEC)

ab: ab.c
	@$(CC) -o ab -I/usr/include/apr-1 -I/usr/include/httpd ab.c -lapr-1 -laprutil-1 -lm

clean:
	rm ab

