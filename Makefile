
T = $(TAG)

dev:
	docker build -f Dockerfile.dev -t myriadeinc/sapphire:dev .

up:
	docker-compose up

build: 
	docker build -f Dockerfile -t myriadeinc/sapphire:${T} .