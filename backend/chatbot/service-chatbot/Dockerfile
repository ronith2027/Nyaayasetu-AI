FROM public.ecr.aws/lambda/python:3.11

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY lambda_chatbot.py ./

CMD ["lambda_chatbot.lambda_handler"]
