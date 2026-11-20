from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "status_code": response.status_code,
            "error": exc.__class__.__name__,
        }
        
        if isinstance(response.data, dict):
            if "detail" in response.data:
                custom_data["detail"] = response.data["detail"]
                errors = {k: v for k, v in response.data.items() if k != "detail"}
                if errors:
                    custom_data["errors"] = errors
            else:
                custom_data["detail"] = "অনুরোধে ত্রুটি রয়েছে। অনুগ্রহ করে তথ্য যাচাই করুন।"
                custom_data["errors"] = response.data
        elif isinstance(response.data, list):
            custom_data["detail"] = response.data[0] if response.data else "অনুরোধে ত্রুটি রয়েছে।"
            custom_data["errors"] = response.data
        else:
            custom_data["detail"] = str(response.data)

        response.data = custom_data

    return response
