FROM php:8.4-cli

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev libicu-dev libzip-dev unzip \
    && docker-php-ext-install pdo_pgsql pgsql pcntl intl zip bcmath \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --no-interaction --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --no-dev \
    && chmod +x docker/start.sh

ENV APP_ENV=production

CMD ["docker/start.sh"]
