web: gunicorn app.run:Application.app --log-file=-
worker: celery worker --app=app.run.celery
