__author__ = 'crespo'
import MySQLdb
import json
import os
import sae.const
import logging
logging.basicConfig(level="DEBUG")

if os.environ.get("SERVER_SOFTWARE") is None:
    with open("conf.json", 'r') as conf_f:
        conf = json.load(conf_f)
    logging.debug("Local env")
    db_conf = conf['db']
    db_host = db_conf.get('host')
    db_username = db_conf.get('username')
    db_password = db_conf.get('password')
    db_name = db_conf.get('name')
    db_port = 3306
else:
    logging.debug("SAE env")
    db_host = sae.const.MYSQL_HOST
    db_username = sae.const.MYSQL_USER
    db_password = sae.const.MYSQL_PASS
    db_name = sae.const.MYSQL_DB
    db_port = int(sae.const.MYSQL_PORT)

def get_db():
    return MySQLdb.connect(host=db_host, user=db_username, passwd=db_password, db=db_name, port=db_port,  charset='utf8')
