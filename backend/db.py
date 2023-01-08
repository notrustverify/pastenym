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
        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def insertText(self, text, url_id, enc_params_b64, private=True, burn=False,ipfs=False):
        self.connect()

        try:
            with database.atomic():
                idInsert = Text.insert(
                    text=text,
                    is_ipfs=ipfs,
                    encryption_params_b64=enc_params_b64,
                    url_id=url_id,
                    is_private=private,
                    is_burn=burn
                ).execute()

                return list(Text.select().where(Text.id == idInsert).dicts())

        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def getTextByUrlId(self, url_id):
        self.connect()

        try:
            with database.atomic():

                Text.update(num_view=Text.num_view +
                            1).where(Text.url_id == url_id).execute()

                data = Text.select(Text.id,
                                   Text.text,
                                   Text.num_view,
                                   Text.created_on,
                                   Text.is_burn,
                                   Text.is_ipfs,
                                   Text.encryption_params_b64
                                   ).where(Text.url_id == url_id).dicts()

                if len(data) == 1:
                    retreivedText = data[0]
                    if retreivedText.get('is_burn'):
                        try:
                            Text.delete().where(
                                Text.id == retreivedText['id']).execute()
                            print(
                                f"Deleted text with id: {retreivedText['id']}")

                        except (KeyError, IndexError) as e:
                            print(f"Error while deleting text {e}")

                    # Remove text id since it's not a useful informations
                    del retreivedText['id']
                    return retreivedText

                return None

        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()


class Text(BaseModel):
    class Meta:
        database = database
        db_table = 'texts'

    text = TextField()
    is_ipfs = BooleanField(default=False,null=True)
    # Setting url_id as index allows faster operations
    url_id = TextField(index=True)
    expiration_time = TimestampField(null=True)
    author = TextField(null=True)
    # If not null, means that 'text' field is encrypted with password
    encryption_params_b64 = TextField(null=True)
    num_view = IntegerField(default=0)
    is_private = BooleanField(null=True)
    is_burn = BooleanField(null=True)  # burn after reading paste

    dayTimeNow = datetime.utcnow().replace(hour=0,minute=0,second=0,microsecond=0)
    created_on = DateTimeField(default=dayTimeNow)
    updated_on = DateTimeField(default=dayTimeNow)


def create_tables():
    with database:
        database.create_tables([Text])
