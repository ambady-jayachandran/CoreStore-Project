# Fix TemplateSyntaxError: Invalid filter 'get_item'

## Steps:
- [x] 1. Delete `customer/templatetags/review_extras.py`
- [x] 2. Update `customer/views.py` order_detail view to pass `review_status_list = [(r.product_id, r) for r in user_reviews]`
- [x] 3. Update `templates/customer-templates/order-detail.html` to replace `get_item` usage with `for pid,review in review_status_list` loop matching `pid == item.variant.product.id`
- [ ] 4. Restart server and test `/order/...`
- [ ] 5. Mark complete

**Current progress: Starting step 1**
