__author__ = 'crespo'

# from werkzeug.contrib.cache import SimpleCache
import pylibmc as memcache
from flask import Flask
from flask.ext import restful
from flask.ext.restful import reqparse, marshal_with, fields
import logging
import data

app = Flask(__name__, static_folder='dist')
app.debug = True

@app.route('/')
def index():
    return app.send_static_file("index.html")

api = restful.Api(app)
parser = reqparse.RequestParser()
logging.basicConfig(level="DEBUG")
cache = memcache.Client()

price_fields = {
    'id': fields.String,
    'share_code': fields.String,
    'date': fields.DateTime(dt_format='iso8601'),
    'price': fields.Float
}


share_fields = {
    'data': fields.Nested(
        {
            'code': fields.String,
            'name': fields.String,
            'managed': fields.String,
            'buy_1': fields.String,
            'buy_2': fields.String,
            'sell': fields.String,
            'last_date': fields.DateTime(dt_format='iso8601')
        }
    ),
    'index': fields.Raw
}

class Shares(restful.Resource):
    @marshal_with(share_fields, envelope='response')
    def get(self):
        data_return = cache.get("all_sharess")
        if data_return is None:
            db = data.get_db()
            cursor = db.cursor()
            cursor.execute("SELECT i.*, p.last_date FROM share_info i join ( SELECT share_code, MAX(date) as last_date FROM share_price GROUP BY share_code) p ON p.share_code = i.code")
            shares = cursor.fetchall()
            all_shares = []
            index_shares = {}
            for share in shares:

                all_shares.append(
                    {
                        "code": share[1],
                        "name": share[2],
                        "managed": share[3],
                        "buy_1": share[4],
                        "buy_2": share[5],
                        "sell": share[6],
                        "pinyin": share[7],
                        "last_date": share[8],
                    }
                )
                index_shares[share[7]] = len(all_shares) - 1
                index_shares[share[1]] = len(all_shares) - 1

            data_return = {"index": index_shares, "data": all_shares}
            cache.set("all_sharess", data_return)
            logging.debug("Return from DB")
            db.commit()
            db.close()
        else:
            logging.debug("Return from memcache")

        return data_return


class Price(restful.Resource):
    @marshal_with(price_fields, envelope='response')
    def get(self, share_id):
        db = data.get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM share_price WHERE share_code= %(share_id)s", {"share_id": share_id})
        results = cursor.fetchall()
        rtn = []
        for r in results:
            rtn.append({
                "id": r[0],
                "share_code": r[1],
                "date": r[2],
                "price": r[3],
            })
        db.commit()
        db.close()

        return rtn

class Share(restful.Resource):
    def get(self, share_q):
        db = data.get_db()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM share_info "
                       "WHERE code LIKE %(share_code)s "
                       "OR name LIKE %(share_name)s OR name_pinyin LIKE %(share_pinyin)s",
                       {"share_name": "%{}%".format(share_q),
                        "share_code": "%{}%".format(share_q),
                        "share_pinyin": "%{}%".format(share_q)})
        results = cursor.fetchall()


        if results is not None:
            shares = []
            for result in results:
                shares.append({
                    "id": result[0],
                    "code": result[1],
                    "name": result[2],
                    "managed": result[3],
                    "buy_1": result[4],
                    "buy_2": result[5],
                    "sell": result[6]
                })
            return_data = {
                "error": False,
                "shares" : shares

            }

        else:
            return_data = {"error": True, "reason": "share not found"}
        db.commit()
        db.close()
        return return_data


api.add_resource(Share, '/api/share/<string:share_q>', '/dev/api/share/<string:share_q>')
api.add_resource(Shares, '/api/shares', '/dev/api/shares')
api.add_resource(Price, '/api/share/<string:share_id>/price', '/dev/api/share/<string:share_id>/price')

parser.add_argument('rate', type=str, help='Rate to charge for this resource')


if __name__ == '__main__':
  app.run(debug=True)