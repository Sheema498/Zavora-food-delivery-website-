.PHONY: all install build start dev test db-setup docker-build docker-run measure clean

all: install build test

install:
	npm install

build:
	npm run build

start:
	npm run start

dev:
	npm run dev

test:
	npm run test:server

db-setup:
	npm run db:setup

measure:
	python measure.py

docker-build:
	docker build -t quickbite-platform:latest .

docker-run:
	docker run -p 5000:5000 quickbite-platform:latest

clean:
	rm -rf dist build server/dist client/dist
