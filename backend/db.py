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
        except (IntegrityError, DoesNotExists) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def insertText(self, text, url_id, enc_params_b64, private=True, burn=False):
        self.connect()

        try:
            with database.atomic():
                idInsert = Text.insert(
                    text=text,
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

                Text.update(num_view=Text.num_view+1).where(Text.url_id == url_id).execute()

                data = Text.select( Text.id,
                                    Text.text,
                                    Text.num_view,
                                    Text.created_on,
                                    Text.is_burn,
                                    Text.encryption_params_b64
                                    ).where(Text.url_id == url_id).dicts()

                if len(data) == 1:
                    retreivedText = data[0]
                    if retreivedText.get('is_burn'):
                        try:
                            Text.delete().where(Text.id == retreivedText['id']).execute()
                            print(f"Deleted text with id: {retreivedText['id']}")

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

    def getPacketsLastUpdate(self):
        self.connect()

        try:
            with database.atomic():
                return None
        
        except (IntegrityError, DoesNotExist) as e:
            print(e)
            print(traceback.format_exc())
            return False
        finally:
            self.close()

    def insertCheckSet(self, ips):
        self.connect()
        try:
            with database.atomic():
                for ip, port in ips.items():
                    now = datetime.utcnow()

                    Mixnodes.insert(ip=ip, http_api_port=port, in_check_set=True, updated_on=now, created_on=now
                                    ).on_conflict(action="update", conflict_target=[Mixnodes.ip],
                                                  update={'ip': ip, 'http_api_port': port, "in_check_set": True,
                                                          'updated_on': datetime.utcnow()}).execute()

        except (IntegrityError, DoesNotExist) as e:
            print(e)
            print(traceback.format_exc())
            return False
        finally:
            self.close()

    def insertActiveSet(self, ips):
        self.connect()

        try:
            with database.atomic():
                for ip, data in ips.items():
                    now = datetime.utcnow()
                    Mixnodes.insert(ip=ip, http_api_port=data['http_api_port'], in_active_set=True, layer=data['layer'],
                                    updated_on=now, created_on=now
                                    ).on_conflict(action="update", conflict_target=[Mixnodes.ip],
                                                  update={'ip': ip, 'http_api_port': data['http_api_port'],
                                                          "in_active_set": True,
                                                          "layer": data['layer'],
                                                          'updated_on': datetime.utcnow()}).execute()
        except (IntegrityError, DoesNotExist) as e:
            print(e)
            print(traceback.format_exc())
            return False
        finally:
            self.close()

    def updateActiveSet(self):
        self.connect()

        try:
            with database.atomic():
                Mixnodes.update(in_active_set=False, updated_on=datetime.utcnow()).where(
                    Mixnodes.in_active_set == True).execute()
        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def updateCheckSet(self):
        self.connect()

        try:
            with database.atomic():
                Mixnodes.update(in_check_set=False, updated_on=datetime.utcnow()).where(
                    Mixnodes.in_check_set == True).execute()
        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def updatePackets(self, ip, http_api_port, num_packets):
        self.connect()

        try:
            with database.atomic():
                Mixnodes.update(packets_mixed=num_packets, updated_on=datetime.utcnow()).where(
                    Mixnodes.ip == ip).execute()
        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def getCheckSet(self):
        self.connect()

        try:
            with database.atomic():
                data = [mixnode for mixnode in Mixnodes.select().where(Mixnodes.in_check_set == True).dicts()]
        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

        return data

    def getActiveSet(self, layer=None):
        self.connect()

        try:
            with database.atomic():
                if layer is not None:
                    data = list(
                        Mixnodes.select().where((Mixnodes.in_active_set == True) & (Mixnodes.layer == layer)).dicts())
                else:
                    data = list(Mixnodes.select().where(Mixnodes.in_active_set == True).dicts())

        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

        return data

    def getMixnodesNoPacketMixed(self):
        self.connect()

        try:
            with database.atomic():
                data = list(
                    Mixnodes.select().where((Mixnodes.in_check_set == True) & (Mixnodes.packets_mixed <= 0)).dicts())
        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

        return data

    def setState(self, mixnet, validator, rpc, epochState, epochId):
        self.connect()

        try:
            with database.atomic():
                State.insert(mixnet=mixnet, validator_api=validator, rpc=rpc, epoch=epochState,
                             epochId=epochId).execute()

        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def getState(self):
        self.connect()

        try:
            with database.atomic():
                return list(State.select().order_by(State.created_on.desc()).limit(1).dicts())

        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def getLastOkTime(self):
        self.connect()

        try:
            with database.atomic():
                return [s for s in State.select(State.created_on).order_by(State.created_on.asc()).limit(1).dicts()][0]

        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def getLastCrashDate(self):
        self.connect()
        try:
            with database.atomic():
                lastCrash = [s for s in State.select(State.created_on).order_by(State.created_on.desc()).where(
                    State.mixnet == False).limit(1).dicts()]

                if len(lastCrash) <= 0:
                    return \
                        [s for s in State.select(State.created_on).order_by(State.created_on.asc()).limit(1).dicts()][0]

                return lastCrash[0]

        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def getTotalMixedPackets(self):
        self.connect()
        try:
            with database.atomic():
                return [s for s in PacketsMixed.select().dicts()][0]

        except (IntegrityError, DoesNotExist) as e:
            logHandler.exception(e)
            return False
        finally:
            self.close()

    def getLastMixedPackets(self, numResults=2):
        self.connect()
        try:
            with database.atomic():
                return list(PacketsMixed.select().order_by(PacketsMixed.created_on.desc()).limit(numResults).dicts())
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
    url_id = TextField(index=True)  # Setting url_id as index allows faster operations
    expiration_time = TimestampField(null=True)
    author = TextField(null=True)
    encryption_params_b64 = TextField(null=True)    # If not null, means that 'text' field is encrypted with password
    num_view = IntegerField(default=0)
    is_private = BooleanField(null=True)
    is_burn = BooleanField(null=True) # burn after reading paste

    created_on = DateTimeField(default=datetime.utcnow)
    updated_on = DateTimeField(default=datetime.utcnow)


def create_tables():
    with database:
        database.create_tables([Text])   