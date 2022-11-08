import logging
import traceback
from datetime import datetime

from peewee import *

database = SqliteDatabase('./data/data.db', pragmas={'foreign_keys': 1})

logger = logging.getLogger('db')
logHandler = logging.getLogger('db')
logHandler.setLevel(logging.DEBUG)


class BaseModel(Model):
    def connect(self):
        try:
            database.connect()
        except Exception as e:
            print(traceback.format_exc())

    def close(self):
        try:
            database.close()
        except Exception as e:
            print(traceback.format_exc())

    def idExists(self, id):
        self.connect()

        try:
            with database.atomic():
                return Text.get_or_none(Text.url_id == id)
        except IntegrityError as e:
            logHandler.exception(e)
            return False
        except DoesNotExist as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def insertText(self, text, url_id,language,private=True,burn=False):
        self.connect()

        try:
            with database.atomic():
                idInsert = Text.insert(text=text, url_id=url_id,is_private=private,is_burn=burn,language=language).execute()

                return list(Text.select().where(Text.id == idInsert).dicts())

        except IntegrityError as e:
            logHandler.exception(e)
            return False
        except DoesNotExist as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def getTextByUrlId(self, url_id):
        self.connect()

        try:
            with database.atomic():

                Text.update(num_view=Text.num_view+1).where(Text.url_id == url_id).execute()

                data = Text.select(Text.id,Text.text,Text.num_view,Text.created_on,Text.is_burn,Text.language).where(Text.url_id == url_id).dicts()

                if len(data) > 0:
                    try:
                        if data[0].get('is_burn'):
                            print(f"text id {data[0]['id']} is deleted")
                            Text.delete().where(Text.id == data[0]['id']).execute()
                    except (KeyError,IndexError) as e:
                        print(f"error with key {e}")

                    # remove text id since it's not a useful informations
                    del data[0]['id']
                    return data[0]

                return None

        except IntegrityError as e:
            logHandler.exception(e)
            return False
        except DoesNotExist as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()



class Text(BaseModel):
    class Meta:
        database = database
        db_table = 'texts'

    text = TextField()
    url_id = TextField(unique=True)
    expiration_time = TimestampField(null=True)
    author = TextField(null=True)
    password_protected = TextField(null=True)
    num_view = IntegerField(default=0)
    is_private = BooleanField(null=True)
    is_burn = BooleanField(null=True) # burn after reading paste
    language = TextField(null=True)

    created_on = DateTimeField(default=datetime.utcnow)
    updated_on = DateTimeField(default=datetime.utcnow)


def create_tables():
    with database:
        database.create_tables([Text])   