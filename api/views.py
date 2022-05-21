from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse
import simplejson as json
import boto3
import base64
from cryptography.fernet import Fernet
import jwt

key=b'HkytbTQAPnSSrsfBpj2ar5qnd3crr3irPoXI0FcTfAM='


class GetItems(APIView):
    def get(self, request, format=None):
        dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
        table = dynamodb.Table('Food')
        x = table.scan()
        return JsonResponse(x['Items'], status=status.HTTP_200_OK, safe=False)


class GetPedidos(APIView):
    def get(self, request, token, format=None):
        x = jwt.decode(token, "secret", algorithms=["HS256"])

        if 'login' in x.keys() and x['login'] == 'true':

            dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
            table = dynamodb.Table('PedidosFinais')
            x = table.scan()

            return JsonResponse(x['Items'], status=status.HTTP_200_OK, safe=False)
        else:
            return JsonResponse({'Message: User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)


class StartRequest(APIView):
    def post(self, request, format=None):
        rekognition = boto3.client('rekognition', region_name='us-east-1')
        dynamodb = boto3.client('dynamodb', region_name='us-east-1')

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        file = body['image']
        input = body['pedido']
        tag = body['tag']
        file = file.split(',')[1]
        image_binary = base64.urlsafe_b64decode(file)

        response = rekognition.search_faces_by_image(
            CollectionId='family_collection',
            Image={'Bytes': image_binary}
        )

        for match in response['FaceMatches']:

            face = dynamodb.get_item(
                TableName='family_collection',
                Key={'RekognitionId': {'S': match['Face']['FaceId']}}
            )

            if 'Item' in face:
                step = boto3.client('stepfunctions', region_name='us-east-1')

                body = {'Pedidos': input, 'user': match['Face']['FaceId'], 'tag': tag}
                response = step.start_execution(
                    stateMachineArn='arn:aws:states:us-east-1:760655477774:stateMachine:GetItemsMachine',
                    input=json.dumps(body)
                )

                response = step.get_activity_task(
                    activityArn='arn:aws:states:us-east-1:760655477774:activity:ProjetoES',
                    workerName='string'
                )
                return JsonResponse({'Message': 'Success', 'token': response["taskToken"], 'input': response['input']},
                                    status=status.HTTP_200_OK)
        return Response({'Bad Request': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)


class GetPrice(APIView):
    def post(self, request, format=None):
        client = boto3.client('lambda', region_name='us-east-1')

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        pedidos = body['pedidos']
        response = client.invoke(FunctionName="GetPrice",
                                 InvocationType="RequestResponse",
                                 Payload=json.dumps(pedidos))
        res_json = json.loads(response['Payload'].read().decode("utf-8"))
        return Response({'Price': str(res_json['body']['price'])}, status=status.HTTP_200_OK)


class FinishRequest(APIView):
    def post(self, request, format=None):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        token = body['token']
        input = body['input']
        step = boto3.client('stepfunctions', region_name='us-east-1')
        response = step.send_task_success(
            taskToken=token,
            output=input
        )
        return JsonResponse({'Message': 'Success', 'token': token, 'input': input},
                            status=status.HTTP_200_OK)


class AddImageIndex(APIView):
    def post(self, request, format=None):
        s3 = boto3.resource('s3')

        # Get list of objects for indexing
        images = [('static/images/Andre1.jpg', 'Andre Silva'),
                  ('static/images/Andre2.jpg', 'Andre Silva'),
                  ('static/images/Andre3.jpg', 'Andre Silva'),
                  ('static/images/Andre4.jpg', 'Andre Silva'),
                  ('static/images/Joao1.jpeg', 'Joao Cruz'),
                  ('static/images/Joao2.jpeg', 'Joao Cruz'),
                  ('static/images/Joao3.jpeg', 'Joao Cruz'),
                  ('static/images/Loreto1.jpeg', 'Mariana Loreto'),
                  ('static/images/Loreto2.jpeg', 'Mariana Loreto'),
                  ('static/images/Loreto3.jpeg', 'Mariana Loreto'),
                  ('static/images/Loreto4.jpeg', 'Mariana Loreto'),
                  ('static/images/ML1.jpeg', 'Mariana Lanca'),
                  ('static/images/ML2.jpeg', 'Mariana Lanca'),
                  ('static/images/ML3.jpeg', 'Mariana Lanca'),
                  ('static/images/ML4.jpeg', 'Mariana Lanca'),
                  ]

        # Iterate through list to upload objects to S3
        for image in images:
            file = open(image[0], 'rb')
            object = s3.Object('testingimageses', 'index/' + image[0])
            ret = object.put(Body=file,
                             Metadata={'FullName': image[1]}
                             )

        return JsonResponse({'Ok': "Ok"}, status=status.HTTP_200_OK)


class Login(APIView):
    def post(self, request, format=None):
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)
        username = body['username']
        password = body['password']
        cipher_suite = Fernet(key)
        dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
        table = dynamodb.Table('staffMembers')

        r = table.get_item(Key={'username': username})
        if 'Item' in r.keys():
            bdPassword = r['Item']['password'][2:len(r['Item']['password'])-1]
            if str.encode(password) == cipher_suite.decrypt(str.encode(bdPassword)):
                encoded_jwt = jwt.encode({"login": "true"}, "secret", algorithm="HS256")
                return JsonResponse({'Message': "LoggedIn", 'token': encoded_jwt}, status=status.HTTP_200_OK)
        return JsonResponse({'Message': "Wrong Password or Username"}, status=status.HTTP_400_BAD_REQUEST)


class CreateUser(APIView):
    def post(self, request, format=None):
        username = "staff"
        password = "1234"
        cipher_suite = Fernet(key)
        ciphered_text = cipher_suite.encrypt(str.encode(password))
        dynamodb = boto3.resource('dynamodb', region_name="us-east-1")
        table = dynamodb.Table('staffMembers')

        table.put_item(Item={'username': username, 'password': str(ciphered_text)})
        return JsonResponse({'Message': "Staff member created"}, status=status.HTTP_200_OK)
