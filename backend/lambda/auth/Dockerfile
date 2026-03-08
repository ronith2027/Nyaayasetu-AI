FROM public.ecr.aws/lambda/python:3.9

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py login.py signup.py ./

CMD ["app.lambda_handler"]
