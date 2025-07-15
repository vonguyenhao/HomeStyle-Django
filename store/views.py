from django.shortcuts import render
from .models import Product
from django.http import JsonResponse

# Create your views here.
def index(request):
    return render(request, 'store/index.html')

def products(request):
    return render(request, 'store/products.html')

def contact(request):
    return render(request, 'store/contact.html')

def faq(request):
    return render(request, 'store/faq.html')

def products(request):
    products = Product.objects.all()
    return render(request, 'store/products.html', {'products': products})

def products_api(request):
    products = Product.objects.all()
    data = []
    for product in products:
        data.append({
            'id': product.id,
            'name': product.name,
            'price': float(product.price),
            'image': product.image.url,
            'category': product.category,
            'subcategory': product.subcategory,
        })
    return JsonResponse({'products': data})