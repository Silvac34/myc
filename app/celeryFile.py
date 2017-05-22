from celery import Celery
import os

def make_celery(app):
    if ('REDIS_URL' not in os.environ):
        os.environ['REDIS_URL'] = 'redis://'
    broker = os.environ['REDIS_URL'] or app.config['REDIS_URL']
    celery = Celery(app.import_name, broker= broker)
    celery.conf.update(app.config)
    TaskBase = celery.Task
    class ContextTask(TaskBase):
        abstract = True
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return TaskBase.__call__(self, *args, **kwargs)
    celery.Task = ContextTask
    return celery